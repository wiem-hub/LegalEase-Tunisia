# app/rag/ingest.py
# Run once: python -m app.rag.ingest
import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
import chromadb

BASE_DIR   = Path(__file__).parent
DATASET    = BASE_DIR / "datasets" / "full_dataset.json"
CHROMA_DIR = BASE_DIR / "chroma_db"
EMBED_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


def build_documents(data: list) -> tuple[list, list, list]:
    texts, metadatas, ids = [], [], []
    skipped = 0

    for entry in data:
        if not isinstance(entry, dict):
            skipped += 1
            continue

        doc_id   = str(entry.get("document_id") or "")
        category = str(entry.get("procedure_category") or "")
        source   = str(entry.get("source_document") or "")

        # ── Title ──
        title_raw = entry.get("title") or {}
        if isinstance(title_raw, dict):
            title_fr = (title_raw.get("fr") or "").strip()
            title_en = (title_raw.get("en") or title_fr).strip()
        else:
            title_fr = title_en = str(title_raw).strip()

        # ── simplified_text — can be string OR dict ──
        simplified = entry.get("simplified_text") or ""

        if isinstance(simplified, str):
            # Single text (English) — use for all languages
            simplified_en = simplified.strip()
            simplified_fr = ""
            simplified_ar = ""
        elif isinstance(simplified, dict):
            simplified_en = (simplified.get("en") or "").strip()
            simplified_fr = (simplified.get("fr") or "").strip()
            simplified_ar = (simplified.get("ar") or "").strip()
        else:
            skipped += 1
            continue

        # ── Sections — multilingual ──
        sections = entry.get("sections") or []
        sections_fr, sections_en = [], []
        for sec in sections:
            content = sec.get("content") or {}
            if isinstance(content, dict):
                cf = (content.get("fr") or "").strip()
                ce = (content.get("en") or "").strip()
                if cf: sections_fr.append(cf)
                if ce: sections_en.append(ce)
            elif isinstance(content, str) and content.strip():
                sections_en.append(content.strip())

        # ── Summary ──
        summary_raw = entry.get("summary") or {}
        if isinstance(summary_raw, dict):
            summary_fr = (summary_raw.get("fr") or "").strip()
            summary_en = (summary_raw.get("en") or "").strip()
        else:
            summary_fr = summary_en = str(summary_raw).strip()

        # ── Build one document per language ──
        lang_docs = []

        # English document
        parts_en = [p for p in [title_en, simplified_en, summary_en] + sections_en if p]
        if parts_en:
            lang_docs.append(("en", "\n\n".join(parts_en), title_en))

        # French document
        parts_fr = [p for p in [title_fr, simplified_fr, summary_fr] + sections_fr if p]
        if parts_fr:
            lang_docs.append(("fr", "\n\n".join(parts_fr), title_fr))

        # Arabic document
        if simplified_ar:
            lang_docs.append(("ar", simplified_ar, title_fr))

        if not lang_docs:
            skipped += 1
            continue

        for lang, text, title in lang_docs:
            texts.append(text)
            metadatas.append({
                "document_id": doc_id,
                "title":       title,
                "source":      source,
                "category":    category,
                "lang":        lang,
            })
            ids.append(f"{doc_id}_{lang}")

    print(f"✅ Built {len(texts)} documents ({skipped} skipped)")
    return texts, metadatas, ids


def ingest():
    print("🔄 Loading embedding model...")
    model = SentenceTransformer(EMBED_MODEL)
    print(f"✅ Model: {EMBED_MODEL}")

    print("🔄 Loading dataset...")
    with open(DATASET, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"✅ {len(data)} entries loaded")

    texts, metadatas, ids = build_documents(data)

    if not texts:
        print("❌ No documents built — check dataset format")
        return

    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    try:
        client.delete_collection("legalease_rag")
        print("🗑️  Old collection deleted")
    except Exception:
        pass

    collection = client.create_collection(
        name="legalease_rag",
        metadata={"hnsw:space": "cosine"},
    )

    print(f"🔄 Generating embeddings for {len(texts)} documents...")
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)

    print("🔄 Inserting into ChromaDB...")
    batch = 100
    for i in range(0, len(texts), batch):
        collection.add(
            documents  = texts[i:i+batch],
            embeddings = embeddings[i:i+batch].tolist(),
            metadatas  = metadatas[i:i+batch],
            ids        = ids[i:i+batch],
        )
        print(f"   {min(i+batch, len(texts))}/{len(texts)} inserted")

    print(f"\n✅ ChromaDB ready — {collection.count()} vectors stored")
    print(f"📁 Saved to: {CHROMA_DIR}")


if __name__ == "__main__":
    ingest()