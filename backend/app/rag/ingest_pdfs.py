# app/rag/ingest_pdfs.py
# Parses the 10 Tunisian legal PDFs and adds them to ChromaDB
# Run: python -m app.rag.ingest_pdfs

import re
from pathlib import Path
from sentence_transformers import SentenceTransformer
import chromadb
import fitz  # pymupdf

BASE_DIR   = Path(__file__).parent
DOCS_DIR   = BASE_DIR / "datasets" / "docs"
CHROMA_DIR = BASE_DIR / "chroma_db"
EMBED_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"

# Chunk size in characters — split large PDFs into smaller pieces
CHUNK_SIZE    = 800
CHUNK_OVERLAP = 100


def detect_lang(text: str) -> str:
    """Simple language detection based on character sets."""
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
    if arabic_chars > len(text) * 0.25:
        return "ar"
    french_words = ["les", "des", "pour", "dans", "une", "est", "qui",
                    "que", "sur", "avec", "par", "entreprise", "article"]
    text_lower = text.lower()
    if sum(1 for w in french_words if f" {w} " in text_lower) >= 3:
        return "fr"
    return "en"


def clean_text(text: str) -> str:
    """Clean extracted PDF text."""
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {3,}', ' ', text)
    # Remove page numbers (standalone numbers)
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start  = 0
    while start < len(text):
        end = start + chunk_size
        # Try to break at sentence boundary
        if end < len(text):
            for sep in ['. ', '.\n', '\n\n', '\n']:
                pos = text.rfind(sep, start, end)
                if pos > start + chunk_size // 2:
                    end = pos + len(sep)
                    break
        chunk = text[start:end].strip()
        if len(chunk) > 100:  # skip very short chunks
            chunks.append(chunk)
        start = end - overlap
    return chunks


def extract_pdf(pdf_path: Path) -> list[dict]:
    """Extract text chunks from a PDF file."""
    print(f"   📄 Parsing: {pdf_path.name}")
    try:
        doc    = fitz.open(str(pdf_path))
        pages  = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                pages.append(text)

        doc.close()

        # Join all pages
        full_text = "\n\n".join(pages)
        full_text = clean_text(full_text)

        if not full_text or len(full_text) < 100:
            print(f"   ⚠️  Skipped (empty or too short): {pdf_path.name}")
            return []

        # Detect language
        lang = detect_lang(full_text[:2000])

        # Detect category from filename
        name_lower = pdf_path.name.lower()
        if any(k in name_lower for k in ["cnss", "labour", "travail", "social"]):
            category = "cnss"
        elif any(k in name_lower for k in ["startup", "entreprise", "creation", "registre", "rne"]):
            category = "startup"
        elif any(k in name_lower for k in ["loi", "decret", "2018", "2002"]):
            category = "startup"
        else:
            category = "startup"

        # Split into chunks
        chunks = chunk_text(full_text)
        print(f"      → {len(chunks)} chunks | lang={lang} | category={category}")

        results = []
        for i, chunk in enumerate(chunks):
            results.append({
                "text":     chunk,
                "lang":     lang,
                "category": category,
                "source":   pdf_path.name,
                "title":    pdf_path.stem[:60],
                "chunk_id": i,
            })

        return results

    except Exception as e:
        print(f"   ❌ Error parsing {pdf_path.name}: {e}")
        return []


def ingest_pdfs():
    print("🔄 Loading embedding model...")
    model = SentenceTransformer(EMBED_MODEL)
    print(f"✅ Model: {EMBED_MODEL}")

    # Find all PDFs
    pdfs = list(DOCS_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"❌ No PDFs found in {DOCS_DIR}")
        return

    print(f"\n📚 Found {len(pdfs)} PDFs — extracting text...\n")

    # Extract all chunks
    all_chunks = []
    for pdf in pdfs:
        chunks = extract_pdf(pdf)
        all_chunks.extend(chunks)

    print(f"\n✅ Total chunks extracted: {len(all_chunks)}")

    if not all_chunks:
        print("❌ No text extracted from PDFs")
        return

    # Connect to existing ChromaDB
    if not CHROMA_DIR.exists():
        print("❌ ChromaDB not found — run python -m app.rag.ingest first")
        return

    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    try:
        collection = client.get_collection("legalease_rag")
        existing   = collection.count()
        print(f"📊 Existing vectors in ChromaDB: {existing}")
    except Exception:
        print("❌ Collection 'legalease_rag' not found — run python -m app.rag.ingest first")
        return

    # Generate embeddings
    texts = [c["text"] for c in all_chunks]
    print(f"\n🔄 Generating embeddings for {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=32)

    # Build ids, metadatas
    metadatas = []
    ids       = []
    for i, chunk in enumerate(all_chunks):
        safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', chunk["source"])
        uid = f"pdf_{safe_name}_{chunk['chunk_id']}_{i}"[:512]
        ids.append(uid)
        metadatas.append({
            "document_id": f"pdf_{i}",
            "title":       chunk["title"],
            "source":      chunk["source"],
            "category":    chunk["category"],
            "lang":        chunk["lang"],
        })

    # Insert in batches
    print(f"\n🔄 Inserting {len(texts)} chunks into ChromaDB...")
    batch = 100
    for i in range(0, len(texts), batch):
        collection.add(
            documents  = texts[i:i+batch],
            embeddings = embeddings[i:i+batch].tolist(),
            metadatas  = metadatas[i:i+batch],
            ids        = ids[i:i+batch],
        )
        print(f"   {min(i+batch, len(texts))}/{len(texts)} inserted")

    total = collection.count()
    print(f"\n✅ ChromaDB updated — {total} total vectors")
    print(f"   Was: {existing} | Added: {total - existing} from PDFs")
    print(f"📁 Saved to: {CHROMA_DIR}")


if __name__ == "__main__":
    ingest_pdfs()