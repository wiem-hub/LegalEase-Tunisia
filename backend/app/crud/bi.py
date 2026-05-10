# app/crud/bi.py  — Business Intelligence analytics queries
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from collections import defaultdict

from app.models.user import User
from app.models.procedure import (
    UserProcedure, UserStepProgress, ProcedureType,
    ProcedureStep, StepDocument, StepStatus,
)
from app.schemas.admin import (
    BIDashboard, TimeSeriesPoint, TimeSeriesData,
    FunnelStep, FunnelData,
    UserActivity, DocumentTypeStat,
    ProcedureTypeStat, StepStat,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_utc(dt: datetime) -> datetime:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


def _date_str(dt: datetime) -> str:
    return _to_utc(dt).strftime('%Y-%m-%d') if dt else ''


def _days_range(days: int) -> List[str]:
    """Return list of ISO date strings for the last N days."""
    today = datetime.now(timezone.utc).date()
    return [(today - timedelta(days=i)).isoformat() for i in range(days - 1, -1, -1)]


# ── Time series ───────────────────────────────────────────────────────────────

def get_registrations_series(db: Session, days: int = 30) -> List[TimeSeriesPoint]:
    """New user registrations per day for the last N days."""
    users = db.query(User).filter(User.created_at.isnot(None)).all()
    counts: dict = defaultdict(int)
    for u in users:
        counts[_date_str(u.created_at)] += 1

    date_range = _days_range(days)
    return [TimeSeriesPoint(date=d, value=counts.get(d, 0)) for d in date_range]


def get_procedures_started_series(db: Session, days: int = 30) -> List[TimeSeriesPoint]:
    """Procedures started per day for the last N days."""
    procs = db.query(UserProcedure).filter(UserProcedure.started_at.isnot(None)).all()
    counts: dict = defaultdict(int)
    for p in procs:
        counts[_date_str(p.started_at)] += 1

    date_range = _days_range(days)
    return [TimeSeriesPoint(date=d, value=counts.get(d, 0)) for d in date_range]


def get_completions_series(db: Session, days: int = 30) -> List[TimeSeriesPoint]:
    """Procedures completed per day for the last N days."""
    procs = db.query(UserProcedure).filter(UserProcedure.completed_at.isnot(None)).all()
    counts: dict = defaultdict(int)
    for p in procs:
        counts[_date_str(p.completed_at)] += 1

    date_range = _days_range(days)
    return [TimeSeriesPoint(date=d, value=counts.get(d, 0)) for d in date_range]


# ── Funnel ────────────────────────────────────────────────────────────────────

def get_funnel(db: Session, procedure_type_id: int) -> Optional[FunnelData]:
    """
    Compute a step-by-step completion funnel for one procedure type.
    For each step: how many users reached it, completed it, got blocked.
    """
    pt = db.query(ProcedureType).filter(ProcedureType.id == procedure_type_id).first()
    if not pt:
        return None

    steps = sorted(pt.steps, key=lambda s: s.order)
    if not steps:
        return FunnelData(procedure_type_id=pt.id, procedure_type_name=pt.name, funnel=[])

    # Total users who started this procedure
    total_users = (
        db.query(func.count(UserProcedure.id))
        .filter(UserProcedure.procedure_type_id == procedure_type_id)
        .scalar() or 0
    )

    funnel: List[FunnelStep] = []
    prev_reached = total_users

    for step in steps:
        # All progress rows for this step
        rows = (
            db.query(UserStepProgress)
            .filter(UserStepProgress.step_id == step.id)
            .all()
        )
        completed = sum(1 for r in rows if r.status == StepStatus.completed)
        blocked   = sum(1 for r in rows if r.status == StepStatus.blocked)
        reached   = len(rows)   # users who have a progress row = reached the step

        drop_rate = round((1 - completed / prev_reached) * 100, 1) if prev_reached > 0 else 0.0

        funnel.append(FunnelStep(
            step_order=step.order,
            step_title=step.title,
            procedure_type=pt.name,
            total_users=reached,
            completed=completed,
            blocked=blocked,
            drop_rate=drop_rate,
        ))
        prev_reached = completed if completed > 0 else reached

    return FunnelData(
        procedure_type_id=pt.id,
        procedure_type_name=pt.name,
        funnel=funnel,
    )


# ── User activity ─────────────────────────────────────────────────────────────

def get_user_activity(db: Session, limit: int = 20) -> List[UserActivity]:
    """Top N most active users with procedure + step + doc counts."""
    users = db.query(User).order_by(User.created_at.desc()).all()

    activity = []
    for u in users:
        procs = db.query(UserProcedure).filter(UserProcedure.user_id == u.id).all()
        proc_ids = [p.id for p in procs]

        steps_done = 0
        if proc_ids:
            steps_done = (
                db.query(func.count(UserStepProgress.id))
                .filter(
                    UserStepProgress.user_procedure_id.in_(proc_ids),
                    UserStepProgress.status == StepStatus.completed,
                )
                .scalar() or 0
            )

        docs = 0
        if proc_ids:
            # Get all step_progress ids for this user
            prog_ids = [
                r.id for r in
                db.query(UserStepProgress.id)
                .filter(UserStepProgress.user_procedure_id.in_(proc_ids))
                .all()
            ]
            if prog_ids:
                docs = (
                    db.query(func.count(StepDocument.id))
                    .filter(StepDocument.step_progress_id.in_(prog_ids))
                    .scalar() or 0
                )

        # Last activity = most recent step_progress update or procedure start
        last_proc = max((p.started_at for p in procs), default=None) if procs else None

        activity.append(UserActivity(
            user_id=u.id,
            username=u.username,
            email=u.email,
            procedures_started=len(procs),
            procedures_completed=sum(1 for p in procs if p.completed_at),
            steps_completed=steps_done,
            documents_uploaded=docs,
            last_active=_date_str(last_proc) if last_proc else None,
        ))

    # Sort by most active (steps + docs)
    activity.sort(key=lambda a: (a.steps_completed + a.documents_uploaded), reverse=True)
    return activity[:limit]


# ── Document type distribution ────────────────────────────────────────────────

def get_document_type_stats(db: Session) -> List[DocumentTypeStat]:
    """Breakdown of uploaded file types."""
    rows = db.query(StepDocument.content_type).all()
    counts: dict = defaultdict(int)
    for (ct,) in rows:
        # Simplify: application/vnd.openxmlformats... → docx
        label = ct
        if 'pdf' in ct:              label = 'PDF'
        elif 'png' in ct:            label = 'PNG'
        elif 'jpeg' in ct or 'jpg' in ct: label = 'JPEG'
        elif 'webp' in ct:           label = 'WebP'
        elif 'wordprocessing' in ct: label = 'DOCX'
        elif 'msword' in ct:         label = 'DOC'
        counts[label] += 1

    total = sum(counts.values()) or 1
    return [
        DocumentTypeStat(
            content_type=ct,
            count=c,
            pct=round(c / total * 100, 1),
        )
        for ct, c in sorted(counts.items(), key=lambda x: -x[1])
    ]


# ── Per-type stats (reuse from admin_crud logic) ──────────────────────────────

def _to_utc_safe(dt):
    if dt is None: return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


def get_procedure_type_stats(db: Session) -> List[ProcedureTypeStat]:
    stats = []
    for pt in db.query(ProcedureType).all():
        procs = db.query(UserProcedure).filter(UserProcedure.procedure_type_id == pt.id).all()
        total = len(procs)
        done  = sum(1 for p in procs if p.completed_at)

        pcts = []
        for proc in procs:
            sp = proc.step_progress
            if sp:
                pcts.append(sum(1 for s in sp if s.status == StepStatus.completed) / len(sp) * 100)
        avg_pct = round(sum(pcts) / len(pcts), 1) if pcts else 0.0

        avg_days = None
        finished = [p for p in procs if p.completed_at and p.started_at]
        if finished:
            dl = []
            for p in finished:
                try: dl.append((_to_utc_safe(p.completed_at) - _to_utc_safe(p.started_at)).days)
                except: pass
            avg_days = round(sum(dl) / len(dl), 1) if dl else None

        stats.append(ProcedureTypeStat(
            id=pt.id, name=pt.name,
            total_started=total, total_completed=done,
            avg_completion_pct=avg_pct, avg_days_to_complete=avg_days,
        ))
    return stats


def get_most_blocked_steps(db: Session, limit: int = 5) -> List[StepStat]:
    try:
        rows = (
            db.query(UserStepProgress, ProcedureStep, ProcedureType)
            .join(ProcedureStep, UserStepProgress.step_id == ProcedureStep.id)
            .join(ProcedureType, ProcedureStep.procedure_type_id == ProcedureType.id)
            .all()
        )
        agg: dict = {}
        for prog, step, pt in rows:
            if step.id not in agg:
                agg[step.id] = {"step_title": step.title, "procedure_type": pt.name, "total": 0, "completed": 0, "blocked": 0}
            agg[step.id]["total"] += 1
            if prog.status == StepStatus.completed: agg[step.id]["completed"] += 1
            elif prog.status == StepStatus.blocked:  agg[step.id]["blocked"] += 1

        return [
            StepStat(**s) for s in
            sorted(agg.values(), key=lambda x: -x["blocked"])[:limit]
        ]
    except:
        return []


# ── Main BI dashboard ─────────────────────────────────────────────────────────

def get_bi_dashboard(db: Session, days: int = 30) -> BIDashboard:
    """Assemble all BI data in one call."""

    total_users          = db.query(func.count(User.id)).scalar() or 0
    active_users         = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_procedures     = db.query(func.count(UserProcedure.id)).scalar() or 0
    completed_procedures = db.query(func.count(UserProcedure.id)).filter(UserProcedure.completed_at.isnot(None)).scalar() or 0
    total_docs           = db.query(func.count(StepDocument.id)).scalar() or 0
    completion_rate      = round(completed_procedures / total_procedures * 100, 1) if total_procedures > 0 else 0.0

    # Avg days to complete across all finished procedures
    finished_procs = db.query(UserProcedure).filter(UserProcedure.completed_at.isnot(None), UserProcedure.started_at.isnot(None)).all()
    avg_days = None
    if finished_procs:
        dl = []
        for p in finished_procs:
            try: dl.append((_to_utc_safe(p.completed_at) - _to_utc_safe(p.started_at)).days)
            except: pass
        avg_days = round(sum(dl) / len(dl), 1) if dl else None

    # Funnels for all procedure types
    all_types = db.query(ProcedureType).all()
    funnels = []
    for pt in all_types:
        f = get_funnel(db, pt.id)
        if f:
            funnels.append(f)

    return BIDashboard(
        total_users=total_users,
        active_users=active_users,
        total_procedures=total_procedures,
        completed_procedures=completed_procedures,
        completion_rate=completion_rate,
        total_documents=total_docs,
        avg_days_to_complete=avg_days,

        registrations_series=get_registrations_series(db, days),
        procedures_series=get_procedures_started_series(db, days),
        completions_series=get_completions_series(db, days),

        procedure_type_stats=get_procedure_type_stats(db),
        funnels=funnels,
        most_blocked_steps=get_most_blocked_steps(db),
        user_activity=get_user_activity(db),
        document_type_stats=get_document_type_stats(db),
    )