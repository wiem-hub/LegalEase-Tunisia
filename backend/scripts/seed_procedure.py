"""
scripts/seed_procedures.py
Run once to populate the database with procedure templates.

Usage:
    python -m scripts.seed_procedures
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal, engine, Base
from app.models.procedure import ProcedureType, ProcedureStep   # noqa: F401
from app.models.user import User                                  # noqa: F401

# Create tables (safe to call multiple times)
Base.metadata.create_all(bind=engine)

PROCEDURES = [
    {
        "name": "Startup Creation in Tunisia",
        "description": "Full legal process to incorporate a company (SARL or SA) in Tunisia.",
        "icon": "building",
        "estimated_days": 30,
        "steps": [
            {
                "order": 1,
                "title": "Choose your legal structure",
                "description": "Decide between SARL (limited liability) or SA (public limited). SARL requires minimum 2 partners and a capital of 1,000 TND.",
                "documents_required": "Business plan, Partner ID copies",
                "estimated_days": 2,
            },
            {
                "order": 2,
                "title": "Draft and notarize the Articles of Association",
                "description": "Prepare the company statutes and have them certified by a notary public (notaire agréé). Includes appointing the manager (gérant).",
                "documents_required": "Articles of Association draft, Partner ID copies, Proof of address, Capital deposit certificate",
                "estimated_days": 5,
            },
            {
                "order": 3,
                "title": "Deposit the share capital",
                "description": "Open a temporary bank account and deposit the minimum share capital. The bank issues a certificate of deposit.",
                "documents_required": "Articles of Association (notarized), Partner ID copies",
                "estimated_days": 3,
            },
            {
                "order": 4,
                "title": "Register at the Registre du Commerce (RNE)",
                "description": "Submit the file to the Registre National des Entreprises (RNE) at the tribunal de première instance or via the e-portail.",
                "documents_required": "Notarized Articles of Association, Capital deposit certificate, Manager criminal record (casier judiciaire), Lease agreement or address proof",
                "estimated_days": 7,
            },
            {
                "order": 5,
                "title": "Obtain the Tax Identification Number (MF)",
                "description": "Register with the Direction Générale des Impôts to obtain your Matricule Fiscal (MF). This is required to issue invoices.",
                "documents_required": "RNE registration certificate, Articles of Association, Manager ID, Lease agreement",
                "estimated_days": 5,
            },
            {
                "order": 6,
                "title": "Register with CNSS as an employer",
                "description": "Once you hire your first employee (or the founder-manager opts in), register the company with the Caisse Nationale de Sécurité Sociale.",
                "documents_required": "RNE certificate, MF number, Manager ID",
                "estimated_days": 3,
            },
            {
                "order": 7,
                "title": "Open a permanent bank account",
                "description": "Convert the temporary capital account into a permanent business account and unblock the funds.",
                "documents_required": "RNE certificate, MF number, Articles of Association",
                "estimated_days": 3,
            },
            {
                "order": 8,
                "title": "Apply for Startup Act label (optional)",
                "description": "If eligible, apply for the official 'Startup Act' label via startup.gov.tn to benefit from tax exemptions, BFPME support and more.",
                "documents_required": "Pitch deck or business plan, Proof of innovation, RNE certificate, MF number",
                "estimated_days": 14,
            },
        ],
    },
    {
        "name": "CNSS Employer Registration",
        "description": "Register your company as an employer and declare your employees to the CNSS.",
        "icon": "shield",
        "estimated_days": 10,
        "steps": [
            {
                "order": 1,
                "title": "Gather required documents",
                "description": "Collect all documents needed for CNSS employer registration.",
                "documents_required": "RNE certificate, MF number, Company address proof, Manager national ID",
                "estimated_days": 1,
            },
            {
                "order": 2,
                "title": "Submit employer registration form (Form 1)",
                "description": "Fill in Form 1 (Demande d'immatriculation employeur) and submit it to the nearest CNSS regional office.",
                "documents_required": "Form 1, RNE certificate, MF certificate, Manager ID",
                "estimated_days": 2,
            },
            {
                "order": 3,
                "title": "Receive employer CNSS number",
                "description": "The CNSS assigns a unique employer number. This is used on all future declarations.",
                "estimated_days": 3,
            },
            {
                "order": 4,
                "title": "Declare each employee (Form 3)",
                "description": "For each new hire, submit Form 3 within 30 days of the hiring date. Include the employee's national ID and employment contract.",
                "documents_required": "Form 3 per employee, Employee national ID, Employment contract",
                "estimated_days": 2,
            },
            {
                "order": 5,
                "title": "Set up quarterly contributions (Déclarations trimestrielles)",
                "description": "Configure your payroll system to calculate and pay CNSS contributions every quarter (salary × 16.57% employer + 9.18% employee).",
                "documents_required": "Payroll records, CNSS employer number",
                "estimated_days": 2,
            },
        ],
    },
    {
        "name": "CNSS Quarterly Declaration",
        "description": "Submit your quarterly social contribution declaration to CNSS.",
        "icon": "calendar",
        "estimated_days": 7,
        "steps": [
            {
                "order": 1,
                "title": "Prepare payroll summary",
                "description": "Compile gross salaries for all employees for the quarter.",
                "documents_required": "Payroll sheets for the quarter",
                "estimated_days": 1,
            },
            {
                "order": 2,
                "title": "Calculate contributions",
                "description": "Apply rates: 16.57% employer share + 9.18% employee share on gross salary. Total = 25.75%.",
                "estimated_days": 1,
            },
            {
                "order": 3,
                "title": "Submit declaration online or at CNSS office",
                "description": "Submit via the CNSS e-services portal (sid.cnss.tn) or in person. Deadline: last day of the month following the quarter end.",
                "documents_required": "Quarterly declaration form, Payroll summary",
                "estimated_days": 2,
            },
            {
                "order": 4,
                "title": "Pay contributions",
                "description": "Pay the total amount by bank transfer, cheque, or at the CNSS counter.",
                "documents_required": "Declaration receipt, Bank details",
                "estimated_days": 2,
            },
            {
                "order": 5,
                "title": "Archive the confirmation receipt",
                "description": "Keep the CNSS payment receipt for at least 5 years for audit purposes.",
                "documents_required": "CNSS payment receipt",
                "estimated_days": 1,
            },
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        for proc_data in PROCEDURES:
            # Skip if already seeded
            existing = db.query(ProcedureType).filter_by(name=proc_data["name"]).first()
            if existing:
                print(f"  [skip] '{proc_data['name']}' already exists.")
                continue

            steps_data = proc_data.pop("steps")
            proc_type = ProcedureType(**proc_data)
            db.add(proc_type)
            db.flush()

            for step_data in steps_data:
                step = ProcedureStep(procedure_type_id=proc_type.id, **step_data)
                db.add(step)

            db.commit()
            print(f"  [ok]   '{proc_type.name}' seeded with {len(steps_data)} steps.")

        print("\nSeeding complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
