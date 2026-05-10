# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Import des modèles dépendants pour que SQLAlchemy les enregistre
from app.models.procedure import UserProcedure, Notification   # <-- ajout critique

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    preferred_lang = Column(String(10), nullable=True, default="fr")
    procedures = relationship("UserProcedure", back_populates="user")
    notifications = relationship(
        "Notification",
        back_populates="user",
        order_by="Notification.created_at.desc()",
        cascade="all, delete-orphan",
    )
    conversations = relationship("ChatConversation", back_populates="user",
                             cascade="all, delete-orphan")