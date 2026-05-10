# app/v1/endpoints/procedure.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from io import BytesIO

# ReportLab imports
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.procedure import (
    ProcedureTypeResponse,
    UserProcedureResponse,
    StartProcedureRequest,
    UpdateStepStatus,
    UpdateStepDueDate,
    UserStepProgressResponse,
)
from app.crud import procedure as crud_procedure

router = APIRouter(prefix="/procedures", tags=["Procedures & Timeline"])


@router.get("/types", response_model=List[ProcedureTypeResponse])
def list_procedure_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_procedure.get_all_procedure_types(db)


@router.get("/types/{type_id}", response_model=ProcedureTypeResponse)
def get_procedure_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pt = crud_procedure.get_procedure_type(db, type_id)
    if not pt:
        raise HTTPException(status_code=404, detail="Procedure type not found")
    return pt


@router.get("/my", response_model=List[UserProcedureResponse])
def my_procedures(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    procedures = crud_procedure.get_user_procedures(db, current_user.id)
    result = []
    for proc in procedures:
        data = UserProcedureResponse.model_validate(proc)
        data.completion_percentage = crud_procedure.compute_completion(proc)
        data.current_step_order = crud_procedure.get_current_step_order(proc)
        result.append(data)
    return result


@router.get("/my/{procedure_id}", response_model=UserProcedureResponse)
def get_my_procedure(
    procedure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proc = crud_procedure.get_user_procedure(db, procedure_id, current_user.id)
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found")
    data = UserProcedureResponse.model_validate(proc)
    data.completion_percentage = crud_procedure.compute_completion(proc)
    data.current_step_order = crud_procedure.get_current_step_order(proc)
    return data


@router.post("/my", response_model=UserProcedureResponse, status_code=status.HTTP_201_CREATED)
def start_procedure(
    body: StartProcedureRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proc = crud_procedure.start_user_procedure(db, current_user.id, body)
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure type not found")
    data = UserProcedureResponse.model_validate(proc)
    data.completion_percentage = crud_procedure.compute_completion(proc)
    data.current_step_order = crud_procedure.get_current_step_order(proc)
    return data


@router.patch("/my/{procedure_id}/steps/{step_id}", response_model=UserStepProgressResponse)
def update_step(
    procedure_id: int,
    step_id: int,
    body: UpdateStepStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress = crud_procedure.update_step_progress(db, procedure_id, step_id, current_user.id, body)
    if not progress:
        raise HTTPException(status_code=404, detail="Step not found")
    return progress


@router.patch("/my/{procedure_id}/steps/{step_id}/due-date", response_model=UserStepProgressResponse)
def set_due_date(
    procedure_id: int,
    step_id: int,
    body: UpdateStepDueDate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Set or clear the deadline for a step."""
    progress = crud_procedure.update_step_due_date(db, procedure_id, step_id, current_user.id, body)
    if not progress:
        raise HTTPException(status_code=404, detail="Step not found")
    return progress


# ── PDF Export ────────────────────────────────────────────────────────────────

@router.get("/export-pdf")
def export_progress_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_procedures = crud_procedure.get_user_procedures(db, current_user.id)
    if not user_procedures:
        raise HTTPException(status_code=404, detail="No procedures found for this user")

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    title_style = styles['Title']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']

    story = []
    story.append(Paragraph(f"Progress Report for {current_user.username}", title_style))
    story.append(Spacer(1, 12))

    for user_proc in user_procedures:
        proc_details = crud_procedure.get_user_procedure(db, user_proc.id, current_user.id)
        if not proc_details:
            continue

        # Compute completion percentage using CRUD helper
        completion = crud_procedure.compute_completion(proc_details)

        story.append(Paragraph(f"Procedure: {proc_details.procedure_type.name}", heading_style))
        story.append(Paragraph(f"Started: {proc_details.started_at.strftime('%Y-%m-%d')}", normal_style))
        story.append(Paragraph(f"Completion: {completion}%", normal_style))
        story.append(Spacer(1, 6))

        # Build table of steps
        table_data = [["Step", "Status", "Completed Date", "Documents"]]
        for step_prog in proc_details.step_progress:
            step = step_prog.step
            completed_date = step_prog.completed_at.strftime('%Y-%m-%d') if step_prog.completed_at else "-"
            # Use original_filename from StepDocument model
            docs = ", ".join([doc.original_filename for doc in step_prog.documents]) if step_prog.documents else "-"
            table_data.append([step.title, step_prog.status, completed_date, docs])

        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
        ]))
        story.append(table)
        story.append(Spacer(1, 12))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=progress_{current_user.username}.pdf"}
    )