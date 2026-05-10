import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
import uuid

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = "uploads/avatars"

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Vérifier le type de fichier
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are allowed")
    
    # Créer le dossier s'il n'existe pas
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Générer un nom de fichier unique
    ext = file.filename.split(".")[-1]
    filename = f"user_{current_user.id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Sauvegarder le fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # URL relative (pour servir via FastAPI)
    avatar_url = f"/{UPLOAD_DIR}/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    
    return {"avatar_url": avatar_url}