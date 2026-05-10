# app/v1/endpoints/ai.py
# RAG-powered AI chat with Darija support + conversation history in DB
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import json, re, httpx

from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage, MessageRole
from app.rag.retriever import retrieve, build_context

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    HAS_LIMITER = True
except ImportError:
    HAS_LIMITER = False

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"


def get_groq_key() -> str:
    key = settings.GROQ_API_KEY
    if not key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured.")
    return key


# ══════════════════════════════════════════════════════════════════════════════
# LANGUAGE DETECTION
# ══════════════════════════════════════════════════════════════════════════════

DARIJA_WORDS = [
    "علاش", "كيفاش", "نجم", "باش", "وين", "فاما", "يزي", "برشا",
    "نحب", "تعمل", "نعمل", "شنية", "احنا", "هوما", "نمشي", "تمشي",
    "وقتاش", "قداش", "بالله", "تخدم", "نخدم", "لازم", "ما نجمش",
    "عندي", "عندك", "موش", "ماكش", "فيش", "عليش", "صاحبي", "خويا",
]

FRENCH_WORDS = [
    "comment", "pourquoi", "entreprise", "créer", "création",
    "quelle", "quels", "obtenir", "déclarer", "enregistrer",
    "procédure", "startup", "déclaration", "employeur", "salarié",
    "cotisation", "quoi", "peut", "dois", "faut", "besoin",
]


def detect_language(text: str) -> str:
    if re.search(r'[\u0600-\u06FF]', text):
        return "darija"
    text_lower = text.lower()
    if any(w in text_lower for w in FRENCH_WORDS):
        return "fr"
    return "en"


def auto_title(message: str, lang: str) -> str:
    clean = message.strip()[:60]
    if len(message) > 60:
        clean += "..."
    return clean


# ══════════════════════════════════════════════════════════════════════════════
# PROMPTS — anti-hallucination renforcé
# ══════════════════════════════════════════════════════════════════════════════

STRICT_GROUNDING = """قواعد أساسية / Règles fondamentales:
1. أجب فقط بناءً على المعلومات الموجودة في الوثائق أدناه
2. لا تخترع معلومات / N'invente aucune information
3. لا تستخدم معرفتك العامة / N'utilise pas tes connaissances générales
4. كل جملة لازم تكون مأخوذة من الوثائق — ممنوع الإضافة
5. Si une information n'est pas dans les documents, ne la mentionne PAS"""

SYSTEM_PROMPTS = {
    "darija": """أنت مساعد إداري تونسي متخصص.
قواعد صارمة جداً:
- اكتب بالدارجة التونسية فقط — مش مصرية، مش فصحى، مش فرنسية
- الدارجة التونسية تستعمل: لازم، نجم، تمشي، تجيب، باش، كيفاش، برشا، موش، وقتاش، قداش، شنية، عندي، ماكش
- المصطلحات الرسمية تبقى كما هي: RNE، CNSS، SARL، SA، API
- ممنوع تكتب كلمة واحدة بالفرنسية أو العربية الفصحى أو المصرية
- ممنوع تخترع معلومات — اكتب فقط ما هو موجود في الوثائق
- إذا ما عندكش المعلومة في الوثائق قل: "هاذي المعلومة موش موجودة في الوثائق"
- ممنوع تقول "يمكن" أو "ربما" — كل جملة لازم تكون من الوثائق فقط""",

    "fr": """Tu es un assistant administratif tunisien spécialisé.
Règles strictes:
- Écris UNIQUEMENT en français standard
- Les termes officiels restent tels quels: RNE, CNSS, SARL, SA, API
- N'invente aucune information — réponds uniquement sur base des documents
- Si l'info n'est pas dans les documents, dis-le clairement""",

    "en": """You are a specialized Tunisian administrative assistant.
Strict rules:
- Write ONLY in English
- Keep official terms as-is: RNE, CNSS, SARL, SA, API
- Do NOT invent information — answer only based on the documents provided
- If the info is not in the documents, say so clearly""",
}

FEW_SHOT = {
    "darija": """
=== أمثلة على الدارجة التونسية الصحيحة ===
مثال 1:
السياق: "Pour créer une entreprise: 1) Rédiger les statuts. 2) Ouvrir un compte bancaire. 3) S'immatriculer au RNE dans les 60 jours."
السؤال: كيفاش نعمل شركة؟
الجواب الصحيح بالدارجة: باش تعمل شركة، لازم:
1) تكتب عقد التأسيس
2) تفتح حساب بنكي باسم الشركة
3) تسجل في RNE في ظرف 60 يوم

مثال 2:
السياق: "La déclaration à la CNSS est obligatoire pour tout employeur dès le premier recrutement."
السؤال: وقتاش لازم نصرح في الكناس؟
الجواب الصحيح بالدارجة: حسب الوثائق، لازم تصرح في الكناس من أول ما تعمل الشركة وقبل ما تخدم أي واحد.
=== نهاية الأمثلة ===
""",
    "fr": """
=== Exemples ===
Contexte: "Pour créer une entreprise: rédiger les statuts, ouvrir un compte, s'immatriculer au RNE."
Question: Comment créer une entreprise?
Réponse: Selon les documents: 1) Rédiger les statuts. 2) Ouvrir un compte bancaire. 3) S'immatriculer au RNE.
=== Fin ===
""",
    "en": """
=== Examples ===
Context: "To create a company: draft statutes, open a bank account, register at the RNE."
Question: How to create a company?
Answer: According to the documents: 1) Draft the statutes. 2) Open a bank account. 3) Register at the RNE.
=== End ===
""",
}

LANG_REMINDER = {
    "darija": "\nتذكير مهم: اكتب جوابك بالدارجة التونسية فقط — مش مصرية، مش فرنسية، مش فصحى. لا تخترع معلومات.\n",
    "fr":     "\nRappel: écris UNIQUEMENT en français. N'invente aucune information.\n",
    "en":     "\nReminder: write ONLY in English. Do not invent information.\n",
}

FALLBACK = {
    "darija": "المعلومة هاذي موش موجودة في الوثائق المتوفرة.",
    "fr":     "Cette information n'est pas disponible dans les documents fournis.",
    "en":     "This information is not available in the provided documents.",
}

PUBLIC_PROMPT = """You are the LegalEase Tunisia welcome assistant.
Explain what LegalEase Tunisia is and how to use it to visitors who haven't signed up yet.
Rules:
- Respond in the SAME language as the visitor
- Keep answers SHORT — 2 to 4 sentences maximum
- Always encourage the visitor to create a free account"""


def build_rag_prompt(lang: str, context: str, question: str) -> str:
    system   = SYSTEM_PROMPTS.get(lang, SYSTEM_PROMPTS["en"])
    examples = FEW_SHOT.get(lang, FEW_SHOT["en"])
    reminder = LANG_REMINDER.get(lang, LANG_REMINDER["en"])
    fallback = FALLBACK.get(lang, FALLBACK["en"])

    if lang == "darija":
        fallback_instr = f'إذا الجواب موش موجود في السياق، قل فقط: "{fallback}"'
        q_label, a_label = "السؤال بالدارجة", "الجواب بالدارجة التونسية فقط"
    elif lang == "fr":
        fallback_instr = f'Si la réponse n\'est pas dans le contexte, dis: "{fallback}"'
        q_label, a_label = "Question", "Réponse en français uniquement"
    else:
        fallback_instr = f'If the answer is not in the context, say: "{fallback}"'
        q_label, a_label = "Question", "Answer in English only"

    return f"""{system}

{STRICT_GROUNDING}

{fallback_instr}

{examples}

=== الوثائق الرسمية / Documents officiels ===
{context}
=== نهاية الوثائق ===
{reminder}
{q_label}: {question}

{a_label}:"""


# ══════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════

class ChatMessageSchema(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message:         str
    history:         Optional[List[ChatMessageSchema]] = []
    lang:            Optional[str] = "auto"
    conversation_id: Optional[int] = None

class ConversationOut(BaseModel):
    id:         int
    title:      Optional[str]
    lang:       Optional[str]
    created_at: str
    messages:   List[dict]

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════════════════════
# STREAMING HELPER
# ══════════════════════════════════════════════════════════════════════════════

async def stream_groq(messages: List[dict], api_key: str):
    async with httpx.AsyncClient(timeout=90.0) as client:
        async with client.stream(
            "POST", GROQ_API_URL,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model":       GROQ_MODEL,
                "messages":    messages,
                "max_tokens":  2048,
                "temperature": 0.0,   # 0.0 = déterministe, élimine hallucinations
                "stream":      True,
            },
        ) as resp:
            if resp.status_code != 200:
                yield f"data: {json.dumps({'error': 'Groq API error'})}\n\n"
                return
            async for line in resp.aiter_lines():
                if not line.startswith("data: "): continue
                raw = line[6:].strip()
                if raw == "[DONE]":
                    yield "data: [DONE]\n\n"; return
                try:
                    delta = json.loads(raw)["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield f"data: {json.dumps({'chunk': delta})}\n\n"
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


# ══════════════════════════════════════════════════════════════════════════════
# DB HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def get_or_create_conversation(
    db: Session,
    user_id: int,
    conversation_id: Optional[int],
    first_message: str,
    lang: str,
) -> ChatConversation:
    if conversation_id:
        conv = db.query(ChatConversation).filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == user_id,
        ).first()
        if conv:
            return conv
    title = auto_title(first_message, lang)
    conv  = ChatConversation(user_id=user_id, title=title, lang=lang)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def save_message(db: Session, conversation_id: int, role: MessageRole, content: str) -> ChatMessage:
    msg = ChatMessage(conversation_id=conversation_id, role=role, content=content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def load_history_from_db(db: Session, conversation_id: int, limit: int = 10) -> List[dict]:
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.id.desc())
        .limit(limit)
        .all()
    )
    return [{"role": m.role.value, "content": m.content} for m in reversed(messages)]


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/chat/public")
async def chat_public(request: Request, req: ChatRequest):
    """No auth — Home page welcome bot."""
    messages = [{"role": "system", "content": PUBLIC_PROMPT}]
    for m in (req.history or [])[-6:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    return StreamingResponse(
        stream_groq(messages, get_groq_key()),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/chat/stream")
async def chat_stream(
    request: Request,
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """RAG-powered chat — saves conversation history to DB."""
    api_key = get_groq_key()
    lang    = req.lang if req.lang and req.lang != "auto" else detect_language(req.message)

    # Save user_id before entering async generator
    user_id = current_user.id

    # Get or create conversation
    conv = get_or_create_conversation(
        db, user_id, req.conversation_id, req.message, lang
    )
    conv_id = conv.id

    # Save user message
    save_message(db, conv_id, MessageRole.user, req.message)

    # Load history from DB
    db_history = load_history_from_db(db, conv_id, limit=8)
    history_for_llm = db_history[:-1] if db_history else []

    # Retrieve relevant documents
    try:
        docs    = retrieve(req.message, lang=lang, top_k=8)
        context = build_context(docs, max_chars=5000)
        print(f"   📊 Docs scores: {[round(d.get('score', 0), 3) for d in docs]}")
    except RuntimeError:
        docs    = []
        context = ""

    # Build prompt
    system_prompt = build_rag_prompt(lang, context, req.message)
    messages = [{"role": "system", "content": system_prompt}]
    for m in history_for_llm[-6:]:
        messages.append({"role": m["role"], "content": m["content"]})

    # Enrich user message to get detailed answers
    if lang == "darija":
        detail_instr = "[أعطني جواب كامل ومفصل بالدارجة مع كل الخطوات والآجال والوثائق المطلوبة]"
    elif lang == "fr":
        detail_instr = "[Donne une réponse complète et détaillée avec toutes les étapes, délais officiels, frais et documents requis. Utilise des listes numérotées.]"
    else:
        detail_instr = "[Give a complete and detailed answer with all steps, official deadlines, fees and required documents. Use numbered lists.]"

    messages.append({
        "role":    "user",
        "content": f"{req.message}\n\n{detail_instr}"
    })

    # Stream and collect full answer for saving
    full_answer = []

    async def generate_and_save():
        async for chunk in stream_groq(messages, api_key):
            yield chunk
            if chunk.startswith("data: ") and chunk.strip() != "data: [DONE]":
                try:
                    data = json.loads(chunk[6:])
                    if "chunk" in data:
                        full_answer.append(data["chunk"])
                except (json.JSONDecodeError, KeyError):
                    pass

        # Save assistant answer to DB
        if full_answer:
            answer_text = "".join(full_answer)
            save_message(db, conv_id, MessageRole.assistant, answer_text)

            # Send sources to frontend
            if docs:
                sources = [
                    {
                        "title":    d.get("title", "")[:60],
                        "source":   d.get("source", ""),
                        "category": d.get("category", ""),
                        "score":    round(d.get("score", 0), 2),
                    }
                    for d in docs[:3]
                    if d.get("score", 0) > 0.4
                ]
                if sources:
                    yield f"data: {json.dumps({'sources': sources})}\n\n"

            yield f"data: {json.dumps({'conversation_id': conv_id})}\n\n"

    return StreamingResponse(
        generate_and_save(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ══════════════════════════════════════════════════════════════════════════════
# HISTORY ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.updated_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id":            c.id,
            "title":         c.title or "Untitled",
            "lang":          c.lang,
            "created_at":    c.created_at.isoformat() if c.created_at else "",
            "message_count": len(c.messages),
        }
        for c in convs
    ]


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {
        "id":         conv.id,
        "title":      conv.title or "Untitled",
        "lang":       conv.lang,
        "created_at": conv.created_at.isoformat() if conv.created_at else "",
        "messages": [
            {
                "role":       m.role.value,
                "content":    m.content,
                "created_at": m.created_at.isoformat() if m.created_at else "",
            }
            for m in conv.messages
        ],
    }


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}


@router.get("/health")
async def ai_health():
    from app.rag.retriever import CHROMA_DIR
    rag_ready = (CHROMA_DIR / "chroma.sqlite3").exists()
    return {
        "configured":       bool(settings.GROQ_API_KEY),
        "model":            GROQ_MODEL,
        "rag_ready":        rag_ready,
        "vectors":          563,
        "public_endpoint":  "POST /api/v1/ai/chat/public",
        "private_endpoint": "POST /api/v1/ai/chat/stream (RAG + history + Darija)",
    }