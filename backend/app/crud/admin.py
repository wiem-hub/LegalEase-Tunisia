# app/crud/admin.py  (updated — full BI analytics)
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import timezone, datetime
from collections import defaultdict

from app.models.user import User
from app.models.procedure import (
    UserProcedure, UserStepProgress, ProcedureType,
    ProcedureStep, StepDocument, StepStatus,
)
from app.schemas.admin import (
    AdminUpdateUser, GlobalStats, ProcedureTypeStat, StepStat,
    AdminProcedureTypeCreate, AdminProcedureTypeUpdate,
    AdminStepCreate, AdminStepUpdate,
    TimeSeriesPoint, StepFunnelItem, DocumentTypeStat,
    UserActivityStat, StatusDistribution,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _to_utc(dt: datetime) -> datetime:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


def _month_label(dt: datetime) -> str:
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return f"{months[dt.month - 1]} {dt.year}"


def _doc_label(ct: str) -> str:
    if ct == 'application/pdf':                                          return 'PDF'
    if ct in ('image/png','image/jpeg','image/jpg','image/webp'):       return 'Image'
    if ct in ('application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'):
                                                                         return 'Word'
    return 'Other'


# ── Users ─────────────────────────────────────────────────────────────────────

def list_users(db: Session, skip: int = 0, limit: int = 50) -> List[User]:
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def update_user(db: Session, user_id: int, data: AdminUpdateUser) -> Optional[User]:
    user = get_user(db, user_id)
    if not user:
        return None
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.is_admin is not None:
        user.is_admin = data.is_admin
    db.commit()
    db.refresh(user)
    return user


def get_user_procedure_count(db: Session, user_id: int) -> int:
    return db.query(UserProcedure).filter(UserProcedure.user_id == user_id).count()


# ── Procedure types ───────────────────────────────────────────────────────────

def create_procedure_type(db: Session, data: AdminProcedureTypeCreate) -> ProcedureType:
    steps_data = data.steps
    pt = ProcedureType(
        name=data.name, description=data.description,
        icon=data.icon, estimated_days=data.estimated_days,
    )
    db.add(pt); db.flush()
    for s in steps_data:
        db.add(ProcedureStep(procedure_type_id=pt.id, **s.model_dump()))
    db.commit(); db.refresh(pt)
    return pt


def update_procedure_type(db: Session, type_id: int, data: AdminProcedureTypeUpdate) -> Optional[ProcedureType]:
    pt = db.query(ProcedureType).filter(ProcedureType.id == type_id).first()
    if not pt:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(pt, field, value)
    db.commit(); db.refresh(pt)
    return pt


def delete_procedure_type(db: Session, type_id: int) -> bool:
    pt = db.query(ProcedureType).filter(ProcedureType.id == type_id).first()
    if not pt:
        return False
    db.delete(pt); db.commit()
    return True


def add_step(db: Session, type_id: int, data: AdminStepCreate) -> Optional[ProcedureStep]:
    if not db.query(ProcedureType).filter(ProcedureType.id == type_id).first():
        return None
    step = ProcedureStep(procedure_type_id=type_id, **data.model_dump())
    db.add(step); db.commit(); db.refresh(step)
    return step


def update_step(db: Session, step_id: int, data: AdminStepUpdate) -> Optional[ProcedureStep]:
    step = db.query(ProcedureStep).filter(ProcedureStep.id == step_id).first()
    if not step:
        return None
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(step, field, value)
    db.commit(); db.refresh(step)
    return step


def delete_step(db: Session, step_id: int) -> bool:
    step = db.query(ProcedureStep).filter(ProcedureStep.id == step_id).first()
    if not step:
        return False
    db.delete(step); db.commit()
    return True


# ── BI: time-series ───────────────────────────────────────────────────────────

def _time_series_last_6_months(rows: list, date_attr: str) -> List[TimeSeriesPoint]:
    """Group any list of ORM objects by month (last 6 months)."""
    now = datetime.now(timezone.utc)
    buckets: dict = {}
    for i in range(5, -1, -1):
        from datetime import timedelta
        d = now - timedelta(days=30 * i)
        key = _month_label(d)
        buckets[key] = 0

    for row in rows:
        dt = getattr(row, date_attr)
        if dt:
            dt = _to_utc(dt)
            label = _month_label(dt)
            if label in buckets:
                buckets[label] += 1

    return [TimeSeriesPoint(label=k, value=v) for k, v in buckets.items()]


# ── BI: step funnel ───────────────────────────────────────────────────────────

def _compute_funnels(db: Session) -> List[StepFunnelItem]:
    rows = (
        db.query(UserStepProgress, ProcedureStep)
        .join(ProcedureStep, UserStepProgress.step_id == ProcedureStep.id)
        .all()
    )

    # group by step_id
    agg = {}
    for progress, step in rows:
        sid = step.id
        if sid not in agg:
            agg[sid] = {
                'step_order':  step.order,
                'step_title':  step.title,
                'total': 0, 'completed': 0, 'blocked': 0,
                'pending': 0, 'in_progress': 0,
            }
        agg[sid]['total'] += 1
        if progress.status == StepStatus.completed:   agg[sid]['completed']   += 1
        elif progress.status == StepStatus.blocked:   agg[sid]['blocked']     += 1
        elif progress.status == StepStatus.pending:   agg[sid]['pending']     += 1
        elif progress.status == StepStatus.in_progress: agg[sid]['in_progress'] += 1

    result = []
    for item in sorted(agg.values(), key=lambda x: x['step_order']):
        rate = round((item['completed'] / item['total']) * 100, 1) if item['total'] else 0.0
        result.append(StepFunnelItem(
            step_order=item['step_order'],
            step_title=item['step_title'],
            total=item['total'],
            completed=item['completed'],
            blocked=item['blocked'],
            pending=item['pending'],
            in_progress=item['in_progress'],
            completion_rate=rate,
        ))
    return result


# ── BI: document types ────────────────────────────────────────────────────────

def _compute_doc_stats(db: Session) -> List[DocumentTypeStat]:
    docs = db.query(StepDocument).all()
    total = len(docs)
    if total == 0:
        return []

    buckets: dict = defaultdict(int)
    for doc in docs:
        buckets[doc.content_type] += 1

    result = []
    for ct, count in sorted(buckets.items(), key=lambda x: -x[1]):
        result.append(DocumentTypeStat(
            content_type=ct,
            label=_doc_label(ct),
            count=count,
            pct=round((count / total) * 100, 1),
        ))
    return result


# ── BI: top users ─────────────────────────────────────────────────────────────

def _compute_top_users(db: Session, limit: int = 8) -> List[UserActivityStat]:
    users = db.query(User).filter(User.is_active == True).all()
    stats = []
    for u in users:
        procs = db.query(UserProcedure).filter(UserProcedure.user_id == u.id).all()
        if not procs:
            continue

        proc_count      = len(procs)
        completed_count = sum(1 for p in procs if p.completed_at)

        # Steps done
        proc_ids = [p.id for p in procs]
        steps_done = (
            db.query(func.count(UserStepProgress.id))
            .filter(
                UserStepProgress.user_procedure_id.in_(proc_ids),
                UserStepProgress.status == StepStatus.completed,
            )
            .scalar() or 0
        )

        # Docs uploaded
        progress_ids = [
            row.id for row in
            db.query(UserStepProgress.id)
            .filter(UserStepProgress.user_procedure_id.in_(proc_ids))
            .all()
        ]
        docs_count = (
            db.query(func.count(StepDocument.id))
            .filter(StepDocument.step_progress_id.in_(progress_ids))
            .scalar() or 0
        ) if progress_ids else 0

        # Last activity
        last_progress = (
            db.query(UserStepProgress)
            .filter(UserStepProgress.user_procedure_id.in_(proc_ids))
            .order_by(UserStepProgress.updated_at.desc())
            .first()
        )
        last_active = last_progress.updated_at if last_progress else None

        stats.append(UserActivityStat(
            username=u.username,
            procedure_count=proc_count,
            completed_count=completed_count,
            total_steps_done=steps_done,
            total_docs_uploaded=docs_count,
            last_active=last_active,
        ))

    # Sort by most active (steps done + docs)
    stats.sort(key=lambda x: x.total_steps_done + x.total_docs_uploaded, reverse=True)
    return stats[:limit]


# ── BI: status distribution ───────────────────────────────────────────────────

def _compute_status_distribution(db: Session) -> StatusDistribution:
    all_progress = db.query(UserStepProgress).all()
    dist = {'completed': 0, 'in_progress': 0, 'pending': 0, 'blocked': 0}
    for p in all_progress:
        key = p.status.value if hasattr(p.status, 'value') else str(p.status)
        if key in dist:
            dist[key] += 1
    return StatusDistribution(**dist)


# ── Main stats entry point ────────────────────────────────────────────────────

def get_global_stats(db: Session) -> GlobalStats:
    # ── KPIs ──
    total_users          = db.query(func.count(User.id)).scalar() or 0
    active_users         = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_procedures     = db.query(func.count(UserProcedure.id)).scalar() or 0
    completed_procedures = (
        db.query(func.count(UserProcedure.id))
        .filter(UserProcedure.completed_at.isnot(None))
        .scalar() or 0
    )
    total_docs = db.query(func.count(StepDocument.id)).scalar() or 0

    completion_rate = round(
        (completed_procedures / total_procedures * 100) if total_procedures else 0.0, 1
    )

    # ── Per-type stats ──
    type_stats = []
    for pt in db.query(ProcedureType).all():
        procs = db.query(UserProcedure).filter(UserProcedure.procedure_type_id == pt.id).all()
        total_s   = len(procs)
        completed_s = sum(1 for p in procs if p.completed_at)

        pcts = []
        for proc in procs:
            steps = proc.step_progress
            if steps:
                done = sum(1 for s in steps if s.status == StepStatus.completed)
                pcts.append(done / len(steps) * 100)
        avg_pct = round(sum(pcts) / len(pcts), 1) if pcts else 0.0

        avg_days = None
        finished = [p for p in procs if p.completed_at and p.started_at]
        if finished:
            dl = []
            for p in finished:
                try:
                    dl.append((_to_utc(p.completed_at) - _to_utc(p.started_at)).days)
                except Exception:
                    pass
            avg_days = round(sum(dl) / len(dl), 1) if dl else None

        type_stats.append(ProcedureTypeStat(
            id=pt.id, name=pt.name,
            total_started=total_s, total_completed=completed_s,
            avg_completion_pct=avg_pct, avg_days_to_complete=avg_days,
        ))

    # ── Global avg days ──
    completed_all = [
        p for p in db.query(UserProcedure).filter(UserProcedure.completed_at.isnot(None)).all()
        if p.started_at
    ]
    global_avg_days = None
    if completed_all:
        dl = []
        for p in completed_all:
            try:
                dl.append((_to_utc(p.completed_at) - _to_utc(p.started_at)).days)
            except Exception:
                pass
        global_avg_days = round(sum(dl) / len(dl), 1) if dl else None

    # ── Most blocked steps ──
    most_blocked = []
    try:
        rows = (
            db.query(UserStepProgress, ProcedureStep, ProcedureType)
            .join(ProcedureStep, UserStepProgress.step_id == ProcedureStep.id)
            .join(ProcedureType, ProcedureStep.procedure_type_id == ProcedureType.id)
            .all()
        )
        agg = {}
        for progress, step, proc_type in rows:
            if step.id not in agg:
                agg[step.id] = {'step_title': step.title, 'procedure_type': proc_type.name,
                                'total': 0, 'completed': 0, 'blocked': 0}
            agg[step.id]['total'] += 1
            if progress.status == StepStatus.completed: agg[step.id]['completed'] += 1
            elif progress.status == StepStatus.blocked:  agg[step.id]['blocked']   += 1

        top5 = sorted(agg.values(), key=lambda x: x['blocked'], reverse=True)[:5]
        most_blocked = [StepStat(**s) for s in top5]
    except Exception:
        most_blocked = []

    # ── BI computations ──
    all_users      = db.query(User).all()
    all_procedures = db.query(UserProcedure).all()

    users_over_time      = _time_series_last_6_months(all_users,      'created_at')
    procedures_over_time = _time_series_last_6_months(all_procedures, 'started_at')
    step_funnels         = _compute_funnels(db)
    document_type_stats  = _compute_doc_stats(db)
    top_users            = _compute_top_users(db)
    status_dist          = _compute_status_distribution(db)

    return GlobalStats(
        total_users=total_users,
        active_users=active_users,
        total_procedures=total_procedures,
        completed_procedures=completed_procedures,
        total_documents_uploaded=total_docs,
        completion_rate=completion_rate,
        avg_days_to_complete=global_avg_days,
        procedure_type_stats=type_stats,
        most_blocked_steps=most_blocked,
        users_over_time=users_over_time,
        procedures_over_time=procedures_over_time,
        step_funnels=step_funnels,
        document_type_stats=document_type_stats,
        top_users=top_users,
        status_distribution=status_dist,
    )