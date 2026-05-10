# app/v1/endpoints/collaboration.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.collaboration import ProcedureCollaborator
from app.models.procedure import UserProcedure

router = APIRouter(prefix="/team", tags=["Team & Collaboration"])

# ── Roles ──────────────────────────────────────────────────────────────────────
ROLES = {
    "owner":      { "label": "Owner",      "can_edit": True,  "can_upload": True,  "can_manage": True  },
    "founder":    { "label": "Founder",    "can_edit": True,  "can_upload": True,  "can_manage": False },
    "accountant": { "label": "Accountant", "can_edit": False, "can_upload": True,  "can_manage": False },
    "lawyer":     { "label": "Lawyer",     "can_edit": False, "can_upload": False, "can_manage": False },
    "viewer":     { "label": "Viewer",     "can_edit": False, "can_upload": False, "can_manage": False },
}

# ── Schemas ───────────────────────────────────────────────────────────────────
class InviteRequest(BaseModel):
    username:     str
    role:         str = "viewer"
    procedure_id: int

class UpdateRoleRequest(BaseModel):
    role: str

# ── Helpers ───────────────────────────────────────────────────────────────────
def check_owner(db: Session, procedure_id: int, user_id: int):
    """Raise 403 if user is not owner of the procedure."""
    proc = db.query(UserProcedure).filter(UserProcedure.id == procedure_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found")
    if proc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can manage collaborators")
    return proc

def format_collaborator(c: ProcedureCollaborator) -> dict:
    return {
        "id":           c.id,
        "user_id":      c.user_id,
        "username":     c.user.username if c.user else "",
        "email":        c.user.email    if c.user else "",
        "role":         c.role,
        "role_label":   ROLES.get(c.role, {}).get("label", c.role),
        "can_edit":     ROLES.get(c.role, {}).get("can_edit", False),
        "can_upload":   ROLES.get(c.role, {}).get("can_upload", False),
        "procedure_id": c.procedure_id,
        "created_at":   c.created_at.isoformat() if c.created_at else "",
    }

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/procedures/{procedure_id}/collaborators")
def list_collaborators(
    procedure_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all collaborators on a procedure."""
    # Check access — owner or collaborator
    proc = db.query(UserProcedure).filter(UserProcedure.id == procedure_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found")

    is_owner = proc.user_id == current_user.id
    is_collab = db.query(ProcedureCollaborator).filter(
        ProcedureCollaborator.procedure_id == procedure_id,
        ProcedureCollaborator.user_id == current_user.id,
    ).first()

    if not is_owner and not is_collab:
        raise HTTPException(status_code=403, detail="Access denied")

    collabs = db.query(ProcedureCollaborator).filter(
        ProcedureCollaborator.procedure_id == procedure_id
    ).all()

    # Include owner as first entry
    result = [{
        "id":           0,
        "user_id":      proc.user_id,
        "username":     proc.user.username if proc.user else "",
        "email":        proc.user.email    if proc.user else "",
        "role":         "owner",
        "role_label":   "Owner",
        "can_edit":     True,
        "can_upload":   True,
        "procedure_id": procedure_id,
        "created_at":   proc.started_at.isoformat() if proc.started_at else "",
    }]

    result += [format_collaborator(c) for c in collabs]
    return result


@router.post("/invite")
def invite_collaborator(
    req: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Invite a registered user to collaborate on a procedure."""
    # Validate role
    if req.role not in ROLES or req.role == "owner":
        raise HTTPException(status_code=422, detail=f"Invalid role. Choose from: {', '.join(k for k in ROLES if k != 'owner')}")

    # Check caller is owner
    check_owner(db, req.procedure_id, current_user.id)

    # Find the target user
    target = db.query(User).filter(User.username == req.username).first()
    if not target:
        raise HTTPException(status_code=404, detail=f"User '{req.username}' not found on LegalEase")

    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot invite yourself")

    # Check not already collaborator
    existing = db.query(ProcedureCollaborator).filter(
        ProcedureCollaborator.procedure_id == req.procedure_id,
        ProcedureCollaborator.user_id      == target.id,
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail=f"@{req.username} is already a collaborator")

    collab = ProcedureCollaborator(
        procedure_id = req.procedure_id,
        user_id      = target.id,
        role         = req.role,
        invited_by   = current_user.id,
    )
    db.add(collab)
    db.commit()
    db.refresh(collab)

    return {
        "message":  f"@{req.username} added as {ROLES[req.role]['label']}",
        "collaborator": format_collaborator(collab),
    }


@router.patch("/{collaborator_id}/role")
def update_role(
    collaborator_id: int,
    req: UpdateRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a collaborator's role."""
    collab = db.query(ProcedureCollaborator).filter(
        ProcedureCollaborator.id == collaborator_id
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Collaborator not found")

    check_owner(db, collab.procedure_id, current_user.id)

    if req.role not in ROLES or req.role == "owner":
        raise HTTPException(status_code=422, detail="Invalid role")

    collab.role = req.role
    db.commit()
    return format_collaborator(collab)


@router.delete("/{collaborator_id}")
def remove_collaborator(
    collaborator_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a collaborator from a procedure."""
    collab = db.query(ProcedureCollaborator).filter(
        ProcedureCollaborator.id == collaborator_id
    ).first()

    if not collab:
        raise HTTPException(status_code=404, detail="Collaborator not found")

    # Owner can remove anyone; collaborator can remove themselves
    is_owner = collab.procedure.user_id == current_user.id
    is_self  = collab.user_id == current_user.id

    if not is_owner and not is_self:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(collab)
    db.commit()
    return {"message": "Collaborator removed"}


@router.get("/my-collaborations")
def my_collaborations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all procedures where current user is a collaborator."""
    collabs = db.query(ProcedureCollaborator).filter(
        ProcedureCollaborator.user_id == current_user.id
    ).all()

    return [
        {
            "collaboration_id": c.id,
            "procedure_id":     c.procedure_id,
            "procedure_title":  c.procedure.title or (c.procedure.procedure_type.name if c.procedure and c.procedure.procedure_type else ""),
            "role":             c.role,
            "role_label":       ROLES.get(c.role, {}).get("label", c.role),
            "owner_username":   c.procedure.user.username if c.procedure and c.procedure.user else "",
            "created_at":       c.created_at.isoformat() if c.created_at else "",
        }
        for c in collabs
    ]


@router.get("/roles")
def get_roles():
    """Get available roles and their permissions."""
    return {k: v for k, v in ROLES.items() if k != "owner"}