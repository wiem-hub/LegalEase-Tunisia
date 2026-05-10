# app/models/collaboration.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ProcedureCollaborator(Base):
    __tablename__ = "procedure_collaborators"

    id              = Column(Integer, primary_key=True, index=True)
    procedure_id    = Column(Integer, ForeignKey("user_procedures.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role            = Column(String(20), nullable=False, default="viewer")
    # roles: owner | founder | accountant | lawyer | viewer
    invited_by      = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Unique: one user per procedure
    __table_args__ = (
        UniqueConstraint("procedure_id", "user_id", name="uq_procedure_collaborator"),
    )

    # Relationships
    user      = relationship("User", foreign_keys=[user_id])
    procedure = relationship("UserProcedure", foreign_keys=[procedure_id])
    inviter   = relationship("User", foreign_keys=[invited_by])