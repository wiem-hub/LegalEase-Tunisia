# app/schemas/procedure.py  (updated — adds due_date + notification schemas)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class StepStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"


class NotificationType(str, Enum):
    deadline_3days = "deadline_3days"
    deadline_today = "deadline_today"
    deadline_passed = "deadline_passed"
    step_completed = "step_completed"
    procedure_done = "procedure_done"


# ── Document ──────────────────────────────────────────────────────────────────

class StepDocumentResponse(BaseModel):
    id: int
    step_progress_id: int
    original_filename: str
    content_type: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ── Step template ─────────────────────────────────────────────────────────────

class ProcedureStepBase(BaseModel):
    order: int
    title: str
    description: Optional[str] = None
    documents_required: Optional[str] = None
    estimated_days: Optional[int] = None


class ProcedureStepResponse(ProcedureStepBase):
    id: int
    procedure_type_id: int

    class Config:
        from_attributes = True


# ── Procedure type ────────────────────────────────────────────────────────────

class ProcedureTypeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    estimated_days: Optional[int] = None
    steps: List[ProcedureStepResponse] = []

    class Config:
        from_attributes = True


# ── Step progress ─────────────────────────────────────────────────────────────

class UserStepProgressResponse(BaseModel):
    id: int
    step_id: int
    status: StepStatus
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None          # Phase 4
    step: ProcedureStepResponse
    documents: List[StepDocumentResponse] = []

    class Config:
        from_attributes = True


class UpdateStepStatus(BaseModel):
    status: StepStatus
    notes: Optional[str] = None


class UpdateStepDueDate(BaseModel):
    due_date: Optional[datetime] = None          # null = clear the deadline


# ── User procedure ────────────────────────────────────────────────────────────

class StartProcedureRequest(BaseModel):
    procedure_type_id: int
    title: Optional[str] = None


class UserProcedureResponse(BaseModel):
    id: int
    procedure_type_id: int
    title: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_active: bool
    procedure_type: ProcedureTypeResponse
    step_progress: List[UserStepProgressResponse] = []
    completion_percentage: Optional[float] = None
    current_step_order: Optional[int] = None

    class Config:
        from_attributes = True


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    user_procedure_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationSummary(BaseModel):
    """Lightweight summary returned in the navbar badge."""
    total: int
    unread: int
    items: List[NotificationResponse]
