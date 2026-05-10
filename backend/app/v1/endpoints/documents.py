# app/v1/endpoints/documents.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.procedure import StepDocumentResponse
from app.crud import document as crud_doc

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/steps/{progress_id}/upload",
    response_model=StepDocumentResponse,
    status_code=201,
)
def upload_document(
    progress_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a file and attach it to a specific step (identified by its progress row id)."""
    return crud_doc.upload_document(db, progress_id, current_user.id, file)


@router.get(
    "/steps/{progress_id}",
    response_model=List[StepDocumentResponse],
)
def list_documents(
    progress_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents attached to a step."""
    return crud_doc.get_documents(db, progress_id, current_user.id)


@router.get("/{doc_id}/download")
def download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download (stream) a document file."""
    doc = crud_doc.get_document(db, doc_id, current_user.id)
    file_path = crud_doc.get_file_path(db, doc_id, current_user.id)
    return FileResponse(
        path=str(file_path),
        media_type=doc.content_type,
        filename=doc.original_filename,
    )


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document (removes file from disk + DB row)."""
    crud_doc.delete_document(db, doc_id, current_user.id)
