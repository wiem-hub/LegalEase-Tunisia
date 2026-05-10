# app/schemas/admin.py  (updated — rich BI schemas)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── User management ───────────────────────────────────────────────────────────

class AdminUserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime
    procedure_count: int = 0

    class Config:
        from_attributes = True


class AdminUpdateUser(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


# ── Procedure type management ─────────────────────────────────────────────────

class AdminStepCreate(BaseModel):
    order: int
    title: str
    description: Optional[str] = None
    documents_required: Optional[str] = None
    estimated_days: Optional[int] = None


class AdminStepUpdate(BaseModel):
    order: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    documents_required: Optional[str] = None
    estimated_days: Optional[int] = None


class AdminProcedureTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    estimated_days: Optional[int] = None
    steps: List[AdminStepCreate] = []


class AdminProcedureTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    estimated_days: Optional[int] = None


# ── BI schemas ────────────────────────────────────────────────────────────────

class TimeSeriesPoint(BaseModel):
    label: str      # "Jan 2026", "Feb 2026", ...
    value: int


class StepFunnelItem(BaseModel):
    step_order: int
    step_title: str
    total: int
    completed: int
    blocked: int
    pending: int
    in_progress: int
    completion_rate: float   # 0–100


class DocumentTypeStat(BaseModel):
    content_type: str
    label: str               # "PDF", "Image", "Word", "Other"
    count: int
    pct: float


class UserActivityStat(BaseModel):
    username: str
    procedure_count: int
    completed_count: int
    total_steps_done: int
    total_docs_uploaded: int
    last_active: Optional[datetime] = None


class StepStat(BaseModel):
    step_title: str
    procedure_type: str
    total: int
    completed: int
    blocked: int
    avg_days_to_complete: Optional[float] = None


class ProcedureTypeStat(BaseModel):
    id: int
    name: str
    total_started: int
    total_completed: int
    avg_completion_pct: float
    avg_days_to_complete: Optional[float] = None


class StatusDistribution(BaseModel):
    completed: int
    in_progress: int
    pending: int
    blocked: int


class GlobalStats(BaseModel):
    # ── KPIs ──
    total_users: int
    active_users: int
    total_procedures: int
    completed_procedures: int
    total_documents_uploaded: int
    completion_rate: float
    avg_days_to_complete: Optional[float] = None

    # ── Existing ──
    procedure_type_stats: List[ProcedureTypeStat]
    most_blocked_steps: List[StepStat]

    # ── BI ──
    users_over_time: List[TimeSeriesPoint]
    procedures_over_time: List[TimeSeriesPoint]
    step_funnels: List[StepFunnelItem]          # flat list, frontend groups by type
    document_type_stats: List[DocumentTypeStat]
    top_users: List[UserActivityStat]
    status_distribution: StatusDistribution