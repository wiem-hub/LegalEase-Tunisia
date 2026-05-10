# app/crud/procedure.py  (updated — due_date + notification triggers on step update)
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import List, Optional

from app.models.procedure import (
    ProcedureType, ProcedureStep,
    UserProcedure, UserStepProgress, StepStatus,
)
from app.schemas.procedure import StartProcedureRequest, UpdateStepStatus, UpdateStepDueDate
from app.crud import notification as crud_notif


# ── Procedure types ───────────────────────────────────────────────────────────

def get_all_procedure_types(db: Session) -> List[ProcedureType]:
    return db.query(ProcedureType).options(joinedload(ProcedureType.steps)).all()


def get_procedure_type(db: Session, procedure_type_id: int) -> Optional[ProcedureType]:
    return (
        db.query(ProcedureType)
        .options(joinedload(ProcedureType.steps))
        .filter(ProcedureType.id == procedure_type_id)
        .first()
    )


# ── User procedures ───────────────────────────────────────────────────────────

def _load_procedure(q):
    return q.options(
        joinedload(UserProcedure.procedure_type).joinedload(ProcedureType.steps),
        joinedload(UserProcedure.step_progress).joinedload(UserStepProgress.step),
        joinedload(UserProcedure.step_progress).joinedload(UserStepProgress.documents),
    )


def get_user_procedures(db: Session, user_id: int) -> List[UserProcedure]:
    return (
        _load_procedure(db.query(UserProcedure))
        .filter(UserProcedure.user_id == user_id, UserProcedure.is_active == True)
        .order_by(UserProcedure.started_at.desc())
        .all()
    )


def get_user_procedure(db: Session, user_procedure_id: int, user_id: int) -> Optional[UserProcedure]:
    return (
        _load_procedure(db.query(UserProcedure))
        .filter(UserProcedure.id == user_procedure_id, UserProcedure.user_id == user_id)
        .first()
    )


def start_user_procedure(db: Session, user_id: int, data: StartProcedureRequest) -> Optional[UserProcedure]:
    proc_type = get_procedure_type(db, data.procedure_type_id)
    if not proc_type:
        return None

    user_procedure = UserProcedure(
        user_id=user_id,
        procedure_type_id=data.procedure_type_id,
        title=data.title or proc_type.name,
    )
    db.add(user_procedure)
    db.flush()

    for step in proc_type.steps:
        progress = UserStepProgress(
            user_procedure_id=user_procedure.id,
            step_id=step.id,
            status=StepStatus.pending,
        )
        db.add(progress)

    db.flush()

    if proc_type.steps:
        first_step = min(proc_type.steps, key=lambda s: s.order)
        first_progress = (
            db.query(UserStepProgress)
            .filter(
                UserStepProgress.user_procedure_id == user_procedure.id,
                UserStepProgress.step_id == first_step.id,
            )
            .first()
        )
        if first_progress:
            first_progress.status = StepStatus.in_progress

    db.commit()
    db.refresh(user_procedure)
    return user_procedure


# ── Step progress ─────────────────────────────────────────────────────────────

def update_step_progress(
    db: Session,
    user_procedure_id: int,
    step_id: int,
    user_id: int,
    data: UpdateStepStatus,
) -> Optional[UserStepProgress]:
    user_procedure = get_user_procedure(db, user_procedure_id, user_id)
    if not user_procedure:
        return None

    progress = (
        db.query(UserStepProgress)
        .filter(
            UserStepProgress.user_procedure_id == user_procedure_id,
            UserStepProgress.step_id == step_id,
        )
        .first()
    )
    if not progress:
        return None

    progress.status = data.status
    progress.notes = data.notes

    if data.status == StepStatus.completed:
        progress.completed_at = datetime.now(timezone.utc)

        # Notify step completed
        crud_notif.notify_step_completed(
            db, user_id,
            step_title=progress.step.title,
            procedure_id=user_procedure_id,
        )

        # Auto-advance next pending step
        next_progress = (
            db.query(UserStepProgress)
            .join(ProcedureStep)
            .filter(
                UserStepProgress.user_procedure_id == user_procedure_id,
                ProcedureStep.order > progress.step.order,
                UserStepProgress.status == StepStatus.pending,
            )
            .order_by(ProcedureStep.order)
            .first()
        )
        if next_progress:
            next_progress.status = StepStatus.in_progress
        else:
            # All steps done → close procedure
            user_procedure.completed_at = datetime.now(timezone.utc)
            crud_notif.notify_procedure_done(
                db, user_id,
                procedure_title=user_procedure.title or user_procedure.procedure_type.name,
                procedure_id=user_procedure_id,
            )

    db.commit()
    db.refresh(progress)
    return progress


def update_step_due_date(
    db: Session,
    user_procedure_id: int,
    step_id: int,
    user_id: int,
    data: UpdateStepDueDate,
) -> Optional[UserStepProgress]:
    """Set or clear the deadline for a step."""
    user_procedure = get_user_procedure(db, user_procedure_id, user_id)
    if not user_procedure:
        return None

    progress = (
        db.query(UserStepProgress)
        .filter(
            UserStepProgress.user_procedure_id == user_procedure_id,
            UserStepProgress.step_id == step_id,
        )
        .first()
    )
    if not progress:
        return None

    progress.due_date = data.due_date
    db.commit()
    db.refresh(progress)
    return progress


# ── Helpers ───────────────────────────────────────────────────────────────────

def compute_completion(user_procedure: UserProcedure) -> float:
    total = len(user_procedure.step_progress)
    if total == 0:
        return 0.0
    done = sum(1 for p in user_procedure.step_progress if p.status == StepStatus.completed)
    return round((done / total) * 100, 1)


def get_current_step_order(user_procedure: UserProcedure) -> Optional[int]:
    in_progress = [p for p in user_procedure.step_progress if p.status == StepStatus.in_progress]
    if not in_progress:
        return None
    return min(in_progress, key=lambda p: p.step.order).step.order
