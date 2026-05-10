# app/rag/translate_darija.py
# Translates all dataset entries to Tunisian Darija using Groq
# Run: python -m app.rag.translate_darija
import json
import time
from pathlib import Path
from groq import Groq
from app.core.config import settings

BASE_DIR    = Path(__file__).parent
DATASET_IN  = BASE_DIR / "datasets" / "full_dataset.json"
DATASET_OUT = BASE_DIR / "datasets" / "enriched_dataset.json"
GROQ_MODEL  = "llama-3.3-70b-versatile"

DARIJA_PROMPT = """You are a Tunisian Darija translator specializing in legal and administrative content.

Translate the following text to Tunisian Darija (not Egyptian Arabic, not Modern Standard Arabic).
Use authentic Tunisian dialect words like:
- لازم (must), نجم (can), باش (to/in order to), كيفاش (how), وقتاش (when)
- برشا (a lot), موش (not), ماكش (there isn't), فاما (there is)
- تعمل (you do), تمشي (you go), تجيب (you bring), تسجل (you register)
- Keep official terms in French: RNE, CNSS, SARL, SA, API, patente

Keep numbered lists as numbered lists.
Respond ONLY with the Darija translation, nothing else.

Text to translate:
{text}"""


def translate_to_darija(client: Groq, text: str) -> str:
    """Translate a text to Tunisian Darija via Groq."""
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": DARIJA_PROMPT.format(text=text)}],
            max_tokens=800,
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"   ⚠️  Translation error: {e}")
        return ""


def get_french_text(entry: dict) -> str:
    """Extract French text from entry sections."""
    sections = entry.get("sections") or []
    parts = []
    for sec in sections:
        content = sec.get("content") or {}
        if isinstance(content, dict):
            fr = (content.get("fr") or "").strip()
            if fr:
                parts.append(fr)
    return "\n".join(parts)


def main():
    api_key = settings.GROQ_API_KEY
    if not api_key:
        print("❌ GROQ_API_KEY not set in .env file")
        return

    client = Groq(api_key=api_key)

    print("🔄 Loading dataset...")
    with open(DATASET_IN, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"✅ {len(data)} entries loaded")

    # Resume support — load already translated entries
    enriched = []
    if DATASET_OUT.exists():
        with open(DATASET_OUT, "r", encoding="utf-8") as f:
            enriched = json.load(f)
        print(f"📂 Resuming — {len(enriched)} entries already translated")

    translated_ids = {str(e.get("document_id")) for e in enriched}

    print(f"\n🌍 Translating {len(data) - len(translated_ids)} entries to Darija...\n")

    for i, entry in enumerate(data):
        doc_id = str(entry.get("document_id", i))

        if doc_id in translated_ids:
            continue

        simplified = entry.get("simplified_text", "")
        en_text    = simplified if isinstance(simplified, str) else simplified.get("en", "")
        fr_text    = get_french_text(entry)

        text_to_translate = en_text or fr_text
        if not text_to_translate.strip():
            print(f"   [{i+1}/{len(data)}] ⚠️  Skipping {doc_id} — no text")
            enriched.append(entry)
            translated_ids.add(doc_id)
            continue

        category = entry.get("procedure_category", "")
        print(f"   [{i+1}/{len(data)}] 🔄 {category} — {doc_id[:40]}")

        darija_text = translate_to_darija(client, text_to_translate)

        enriched_entry = dict(entry)
        enriched_entry["simplified_text"] = {
            "en": en_text,
            "fr": fr_text or en_text,
            "ar": darija_text,
        }

        enriched.append(enriched_entry)
        translated_ids.add(doc_id)

        # Save after every entry (resume safety)
        with open(DATASET_OUT, "w", encoding="utf-8") as f:
            json.dump(enriched, f, ensure_ascii=False, indent=2)

        print(f"      ✅ {len(darija_text)} chars")

        # Rate limit: 2s between requests
        time.sleep(2)

    print(f"\n✅ Translation complete — {len(enriched)} entries")
    print(f"📁 Saved to: {DATASET_OUT}")
    print(f"\n▶️  Next steps:")
    print(f"   copy app\\rag\\datasets\\enriched_dataset.json app\\rag\\datasets\\full_dataset.json")
    print(f"   python -m app.rag.ingest")
    print(f"   python -m app.rag.ingest_pdfs")


if __name__ == "__main__":
    main()