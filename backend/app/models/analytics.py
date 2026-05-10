# app/models/analytics.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class AIQueryLog(Base):
    __tablename__ = "ai_query_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, nullable=True, index=True)
    question    = Column(Text, nullable=False)
    lang        = Column(String(10), nullable=True, index=True)
    category    = Column(String(50), nullable=True, index=True)
    docs_found  = Column(Integer, default=0)
    answered    = Column(Boolean, default=True)
    endpoint    = Column(String(20), default="stream")
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class AIFeedback(Base):
    __tablename__ = "ai_feedback"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, nullable=True, index=True)
    conversation_id = Column(Integer, nullable=True, index=True)
    message_index   = Column(Integer, nullable=True)   # index of the message in conversation
    question        = Column(Text, nullable=True)       # the user question
    answer          = Column(Text, nullable=True)       # the AI answer
    rating          = Column(String(10), nullable=False) # "up" or "down"
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), index=True)