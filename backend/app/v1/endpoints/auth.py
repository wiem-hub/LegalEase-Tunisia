from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.dependencies import get_current_user
from app.crud import user as crud_user
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate, PasswordChange
from app.core.config import settings
from app.models.user import User
from app.services.email import send_welcome_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if crud_user.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud_user.get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    user = crud_user.create_user(db, user_in)
    # Send welcome email
    try:
        from app.services.email import send_welcome_email
        send_welcome_email(user.email, user.username)
    except Exception:
        pass  # Ne pas bloquer l'inscription si l'email échoue
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud_user.get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_access_token(
        data={"sub": user.username, "is_admin": user.is_admin},   # ← inclusion de is_admin
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.options("/signup")
def options_signup():
    return {"message": "OK"}


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    if user_update.email and user_update.email != current_user.email:
        existing = crud_user.get_user_by_email(db, user_update.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email

    # Vérifier si le nouveau username est déjà utilisé
    if user_update.username and user_update.username != current_user.username:
        existing = crud_user.get_user_by_username(db, user_update.username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password")
def change_password(
    passwords: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(passwords.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    if len(passwords.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    current_user.hashed_password = get_password_hash(passwords.new_password)
    db.commit()
    return {"message": "Password updated successfully"}