# app/v1/endpoints/analytics.py
# Analytics endpoints — admin only
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.analytics.tracker import (
    get_overview,
    get_language_stats,
    get_procedure_stats,
    get_keyword_stats,
    get_recent_queries,
    get_unanswered_queries,
    get_daily_stats,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_admin", False):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


@router.get("/overview")
def analytics_overview(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """General stats — total queries, answer rate."""
    return {
        **get_overview(db),
        **get_language_stats(db),
        **get_procedure_stats(db),
        "daily": get_daily_stats(db, days=7),
    }


@router.get("/keywords")
def analytics_keywords(
    top_n: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Top keywords used in questions."""
    return get_keyword_stats(db, top_n=top_n)


@router.get("/recent")
def analytics_recent(
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Most recent queries."""
    return {"queries": get_recent_queries(db, limit=limit)}


@router.get("/gaps")
def analytics_gaps(
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Unanswered queries — detect dataset gaps."""
    return {"unanswered": get_unanswered_queries(db, limit=limit)}