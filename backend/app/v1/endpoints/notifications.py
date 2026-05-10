# app/v1/endpoints/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.procedure import NotificationResponse, NotificationSummary
from app.crud import notification as crud_notif

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationSummary)
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return notifications + unread count for the navbar badge."""
    items = crud_notif.get_user_notifications(db, current_user.id, unread_only=unread_only)
    unread = crud_notif.get_unread_count(db, current_user.id)
    return NotificationSummary(total=len(items), unread=unread, items=items)


@router.patch("/{notif_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ok = crud_notif.mark_read(db, notif_id, current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    items = crud_notif.get_user_notifications(db, current_user.id)
    notif = next((n for n in items if n.id == notif_id), None)
    return notif


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = crud_notif.mark_all_read(db, current_user.id)
    return {"marked_read": count}
