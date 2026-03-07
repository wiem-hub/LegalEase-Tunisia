from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.crud import user as crud_user
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'email ou le username existe déjà
    if crud_user.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud_user.get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    user = crud_user.create_user(db, user_in)
    return user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Recherche par username (ou email selon votre choix)
    user = crud_user.get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.options("/signup")
def options_signup():
    return {"message": "OK"}