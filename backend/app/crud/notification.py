# app/crud/notification.py  (updated section)
# Add this function to your existing notification.py
# It replaces or extends the existing check_deadlines function

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.procedure import UserStepProgress, UserProcedure
from app.models.user import User
from app.models.procedure import Notification

# Import email service
try:
    from app.services.email import send_deadline_reminder
    EMAIL_ENABLED = True
except ImportError:
    EMAIL_ENABLED = False
    print("⚠️  Email service not available")


def check_deadlines(db: Session) -> int:
    """
    Check all step deadlines and send email reminders.
    Called every day at 8:00 AM by APScheduler.
    Returns the number of emails sent.
    """
    today     = datetime.utcnow().date()
    sent      = 0
    thresholds = [0, 1, 3]  # Send reminders at 0, 1, and 3 days before deadline

    # Get all steps with a due date that are not completed
    steps = (
        db.query(UserStepProgress)
        .filter(
            UserStepProgress.due_date.isnot(None),
            UserStepProgress.status.notin_(["completed"]),
        )
        .all()
    )

    for step in steps:
        due = step.due_date
        if hasattr(due, 'date'):
            due = due.date()

        days_remaining = (due - today).days

        if days_remaining not in thresholds:
            continue

        # Get the user procedure and user
        user_procedure = db.query(UserProcedure).filter(
            UserProcedure.id == step.user_procedure_id
        ).first()

        if not user_procedure:
            continue

        user = db.query(User).filter(User.id == user_procedure.user_id).first()
        if not user or not user.email:
            continue

        procedure_name = (
            user_procedure.title
            or getattr(user_procedure.procedure_type, 'name', 'Procédure')
        )

        print(f"   📧 Sending reminder to {user.email} — {step.step.title} ({days_remaining}d)")

        if EMAIL_ENABLED:
            success = send_deadline_reminder(
                to_email       = user.email,
                username       = user.username,
                step_title     = step.step.title,
                procedure_name = procedure_name,
                days_remaining = days_remaining,
                due_date       = str(due),
            )
            if success:
                sent += 1
        else:
            print(f"   ⚠️  Email disabled — would have sent to {user.email}")

    print(f"[scheduler] ✅ {sent} deadline reminders sent")
    return sent



def get_user_notifications(db: Session, user_id: int, unread_only: bool = False):
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(50).all()

def get_unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).count()

def mark_read(db: Session, notif_id: int, user_id: int) -> bool:
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id,
    ).first()
    if not notif:
        return False
    notif.is_read = True
    db.commit()
    return True

def mark_all_read(db: Session, user_id: int) -> int:
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return count
def notify_step_completed(
    db: Session,
    user_id: int,
    step_title: str,
    procedure_id: int,
) -> None:
    notif = Notification(
        user_id          = user_id,
        title            = f'Step completed',
        message          = f'✅ Step "{step_title}" completed!',
        type             = "step_completed",
        user_procedure_id = procedure_id,
    )
    db.add(notif)
    db.commit()


def notify_procedure_done(
    db: Session,
    user_id: int,
    procedure_title: str,
    procedure_id: int,
) -> None:
    notif = Notification(
        user_id          = user_id,
        title            = f'Procedure completed',
        message          = f'🎉 Procedure "{procedure_title}" is fully completed!',
        type             = "procedure_completed",
        user_procedure_id = procedure_id,
    )
    db.add(notif)
    db.commit()