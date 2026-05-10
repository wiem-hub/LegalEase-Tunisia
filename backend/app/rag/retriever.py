# app/rag/retriever.py
# Retrieves relevant documents from ChromaDB for a given question
from pathlib import Path
from typing import Optional
from sentence_transformers import SentenceTransformer
import chromadb
from typing import Optional

EMBED_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"
CHROMA_DIR  = Path(__file__).parent / "chroma_db"

# Language mapping — darija → search in French docs
LANG_MAP = {
    "darija": "fr",
    "ar":     "fr",
    "fr":     "fr",
    "en":     "en",
    "auto":   None,   # search all languages
}

# Singleton — load once at startup
_model:      Optional[SentenceTransformer] = None
_client:     Optional[chromadb.PersistentClient] = None
_collection: Optional[chromadb.Collection] = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("🔄 Loading embedding model...")
        _model = SentenceTransformer(EMBED_MODEL)
        print("✅ Embedding model ready")
    return _model


def get_collection() -> chromadb.Collection:
    global _client, _collection
    if _collection is None:
        if not CHROMA_DIR.exists():
            raise RuntimeError(
                "ChromaDB not found. Run: python -m app.rag.ingest"
            )
        _client     = chromadb.PersistentClient(path=str(CHROMA_DIR))
        _collection = _client.get_collection("legalease_rag")
        print(f"✅ ChromaDB loaded — {_collection.count()} vectors")
    return _collection


def retrieve(question: str, lang: str = "auto", top_k: int = 5) -> list:
    """
    Retrieve the most relevant documents for a question.

    Returns a list of dicts with keys:
        - text: str
        - title: str
        - source: str
        - category: str
        - lang: str
        - score: float (0→1, higher = more relevant)
    """
    model      = get_model()
    collection = get_collection()

    # Embed the question
    query_embedding = model.encode(question).tolist()

    # Build filter based on language
    search_lang = LANG_MAP.get(lang, None)
    where       = {"lang": search_lang} if search_lang else None

    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"],
    )

    # If no results with lang filter, retry without filter
    if not results["documents"][0] and where:
        print(f"   ⚠️ No results for lang={search_lang}, retrying without filter")
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

    docs = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        # Convert cosine distance to similarity score (0→1)
        score = round(1 - dist, 4)
        docs.append({
            "text":     doc,
            "title":    meta.get("title", ""),
            "source":   meta.get("source", ""),
            "category": meta.get("category", ""),
            "lang":     meta.get("lang", ""),
            "score":    score,
        })

    # Sort by score descending
    docs.sort(key=lambda x: x["score"], reverse=True)

    print(f"   📚 Retrieved {len(docs)} docs for '{question[:50]}' [{lang}]")
    for d in docs:
        print(f"      {'✅' if d['score'] > 0.5 else '⚠️'} {d['score']:.3f} | {d['title'][:50]}")

    return docs


def build_context(docs: list[dict], max_chars: int = 3000) -> str:
    """Format retrieved documents as context for the LLM prompt."""
    if not docs:
        return ""

    parts = []
    total = 0

    for i, doc in enumerate(docs, 1):
        header = f"[Document {i}]"
        if doc["title"]:
            header += f" {doc['title']}"
        if doc["source"]:
            header += f" (Source: {doc['source']})"

        block = f"{header}\n{doc['text']}"

        if total + len(block) > max_chars:
            # Add truncated version if space allows
            remaining = max_chars - total
            if remaining > 200:
                parts.append(block[:remaining] + "...")
            break

        parts.append(block)
        total += len(block)

    return "\n\n---\n\n".join(parts)