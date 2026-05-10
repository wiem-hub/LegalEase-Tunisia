# app/crud/document.py
import uuid
import os
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models.procedure import StepDocument, UserStepProgress, UserProcedure

# ── Config ────────────────────────────────────────────────────────────────────

UPLOAD_DIR = Path("uploads")          # stored relative to project root
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024      # 10 MB
ALLOWED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _assert_progress_owned(db: Session, progress_id: int, user_id: int) -> UserStepProgress:
    """Raise 404 if progress row doesn't exist or doesn't belong to user."""
    progress = (
        db.query(UserStepProgress)
        .join(UserProcedure)
        .filter(
            UserStepProgress.id == progress_id,
            UserProcedure.user_id == user_id,
        )
        .first()
    )
    if not progress:
        raise HTTPException(status_code=404, detail="Step not found")
    return progress


# ── CRUD ──────────────────────────────────────────────────────────────────────

def upload_document(
    db: Session,
    progress_id: int,
    user_id: int,
    file: UploadFile,
) -> StepDocument:
    progress = _assert_progress_owned(db, progress_id, user_id)

    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. "
                   f"Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.",
        )

    # Read and check size
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 10 MB limit.")

    # Build a unique stored filename  (uuid + original extension)
    suffix = Path(file.filename).suffix.lower()
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    dest = UPLOAD_DIR / stored_name

    # Write to disk
    with open(dest, "wb") as f:
        f.write(content)

    doc = StepDocument(
        step_progress_id=progress.id,
        original_filename=file.filename,
        stored_filename=stored_name,
        content_type=file.content_type,
        file_size=len(content),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_documents(db: Session, progress_id: int, user_id: int) -> List[StepDocument]:
    _assert_progress_owned(db, progress_id, user_id)
    return (
        db.query(StepDocument)
        .filter(StepDocument.step_progress_id == progress_id)
        .order_by(StepDocument.uploaded_at)
        .all()
    )


def get_document(db: Session, doc_id: int, user_id: int) -> StepDocument:
    doc = (
        db.query(StepDocument)
        .join(UserStepProgress)
        .join(UserProcedure)
        .filter(
            StepDocument.id == doc_id,
            UserProcedure.user_id == user_id,
        )
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


def delete_document(db: Session, doc_id: int, user_id: int) -> None:
    doc = get_document(db, doc_id, user_id)

    # Remove from disk
    file_path = UPLOAD_DIR / doc.stored_filename
    if file_path.exists():
        file_path.unlink()

    db.delete(doc)
    db.commit()


def get_file_path(db: Session, doc_id: int, user_id: int) -> Path:
    """Return the absolute path for serving the file."""
    doc = get_document(db, doc_id, user_id)
    path = UPLOAD_DIR / doc.stored_filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return path
