# app/models/procedure.py  (updated — adds due_date on UserStepProgress)
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class StepStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"


class ProcedureType(Base):
    __tablename__ = "procedure_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    estimated_days = Column(Integer, nullable=True)

    steps = relationship("ProcedureStep", back_populates="procedure_type", order_by="ProcedureStep.order")
    user_procedures = relationship("UserProcedure", back_populates="procedure_type")


class ProcedureStep(Base):
    __tablename__ = "procedure_steps"

    id = Column(Integer, primary_key=True, index=True)
    procedure_type_id = Column(Integer, ForeignKey("procedure_types.id"), nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    documents_required = Column(Text, nullable=True)
    estimated_days = Column(Integer, nullable=True)

    procedure_type = relationship("ProcedureType", back_populates="steps")
    user_progress = relationship("UserStepProgress", back_populates="step")


class UserProcedure(Base):
    __tablename__ = "user_procedures"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    procedure_type_id = Column(Integer, ForeignKey("procedure_types.id"), nullable=False)
    title = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="procedures")
    procedure_type = relationship("ProcedureType", back_populates="user_procedures")
    step_progress = relationship(
        "UserStepProgress",
        back_populates="user_procedure",
        order_by="UserStepProgress.step_id"
    )


class UserStepProgress(Base):
    __tablename__ = "user_step_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_procedure_id = Column(Integer, ForeignKey("user_procedures.id"), nullable=False)
    step_id = Column(Integer, ForeignKey("procedure_steps.id"), nullable=False)
    status = Column(Enum(StepStatus), default=StepStatus.pending, nullable=False)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ── Phase 4: deadline per step ────────────────────────────────────────────
    due_date = Column(DateTime(timezone=True), nullable=True)

    user_procedure = relationship("UserProcedure", back_populates="step_progress")
    step = relationship("ProcedureStep", back_populates="user_progress")
    documents = relationship("StepDocument", back_populates="step_progress", cascade="all, delete-orphan")


class StepDocument(Base):
    __tablename__ = "step_documents"

    id = Column(Integer, primary_key=True, index=True)
    step_progress_id = Column(Integer, ForeignKey("user_step_progress.id"), nullable=False)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False, unique=True)
    content_type = Column(String, nullable=False)
    file_size = Column(BigInteger, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    step_progress = relationship("UserStepProgress", back_populates="documents")


# ── Phase 4: in-app notifications ────────────────────────────────────────────

class NotificationType(str, enum.Enum):
    deadline_3days = "deadline_3days"   # due in 3 days
    deadline_today = "deadline_today"   # due today
    deadline_passed = "deadline_passed" # overdue
    step_completed = "step_completed"   # a step was completed
    procedure_done = "procedure_done"   # whole procedure finished


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    # Optional link to the related procedure
    user_procedure_id = Column(Integer, ForeignKey("user_procedures.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
    user_procedure = relationship("UserProcedure")
