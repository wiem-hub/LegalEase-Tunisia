# app/analytics/tracker.py
# Adapted from colleague's analytics/tracker.py — persisted to PostgreSQL
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from collections import defaultdict
from typing import Optional
from app.models.analytics import AIQueryLog


def log_query(
    db: Session,
    question: str,
    lang: str,
    docs_found: int,
    category: Optional[str],
    answered: bool,
    user_id: Optional[int] = None,
    endpoint: str = "stream",
) -> None:
    """Log every AI query to DB for analytics."""
    entry = AIQueryLog(
        user_id    = user_id,
        question   = question[:500],   # truncate very long questions
        lang       = lang,
        category   = category,
        docs_found = docs_found,
        answered   = answered,
        endpoint   = endpoint,
    )
    db.add(entry)
    db.commit()


def get_overview(db: Session) -> dict:
    """General stats — adapted from colleague's get_overview()."""
    total    = db.query(func.count(AIQueryLog.id)).scalar() or 0
    answered = db.query(func.count(AIQueryLog.id)).filter(AIQueryLog.answered == True).scalar() or 0

    return {
        "total_queries":      total,
        "answered_queries":   answered,
        "unanswered_queries": total - answered,
        "answer_rate":        round(answered / total * 100, 1) if total else 0,
    }


def get_language_stats(db: Session) -> dict:
    """Language distribution — adapted from colleague's get_language_stats()."""
    rows = (
        db.query(AIQueryLog.lang, func.count(AIQueryLog.id).label("count"))
        .group_by(AIQueryLog.lang)
        .order_by(desc("count"))
        .all()
    )
    return {
        "language_distribution": {r.lang or "unknown": r.count for r in rows}
    }


def get_procedure_stats(db: Session) -> dict:
    """Procedure category hits — adapted from colleague's get_procedure_stats()."""
    rows = (
        db.query(AIQueryLog.category, func.count(AIQueryLog.id).label("count"))
        .filter(AIQueryLog.category.isnot(None))
        .group_by(AIQueryLog.category)
        .order_by(desc("count"))
        .all()
    )
    return {
        "procedure_hits": {r.category: r.count for r in rows}
    }


def get_keyword_stats(db: Session, top_n: int = 20) -> dict:
    """Top keywords — adapted from colleague's get_keyword_stats()."""
    rows = db.query(AIQueryLog.question).all()
    keyword_counter: dict = defaultdict(int)
    for (question,) in rows:
        for word in question.lower().split():
            if len(word) > 3:
                keyword_counter[word] += 1
    top = sorted(keyword_counter.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return {"top_keywords": dict(top)}


def get_recent_queries(db: Session, limit: int = 20) -> list:
    """Recent queries — adapted from colleague's get_recent_queries()."""
    rows = (
        db.query(AIQueryLog)
        .order_by(desc(AIQueryLog.created_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "id":         r.id,
            "question":   r.question,
            "lang":       r.lang,
            "category":   r.category,
            "docs_found": r.docs_found,
            "answered":   r.answered,
            "endpoint":   r.endpoint,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in rows
    ]


def get_unanswered_queries(db: Session, limit: int = 20) -> list:
    """Queries the RAG couldn't answer — useful to detect dataset gaps."""
    rows = (
        db.query(AIQueryLog)
        .filter(AIQueryLog.answered == False)
        .order_by(desc(AIQueryLog.created_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "question":   r.question,
            "lang":       r.lang,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in rows
    ]


def get_daily_stats(db: Session, days: int = 7) -> list:
    """Queries per day for the last N days."""
    from sqlalchemy import cast, Date
    rows = (
        db.query(
            cast(AIQueryLog.created_at, Date).label("day"),
            func.count(AIQueryLog.id).label("count"),
        )
        .group_by("day")
        .order_by("day")
        .limit(days)
        .all()
    )
    return [{"day": str(r.day), "count": r.count} for r in rows]