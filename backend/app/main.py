# app/main.py  (final — all routers registered)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler

from app.v1.endpoints import auth, procedure, documents, notifications, admin
from app.core.database import SessionLocal
from app.crud.notification import check_deadlines
from app.v1.endpoints import ai

from app.v1.endpoints import analytics, upload, feedback, collaboration


def run_deadline_check():
    db = SessionLocal()
    try:
        check_deadlines(db)
        print("[scheduler] Deadline check completed.")
    finally:
        db.close()


scheduler = BackgroundScheduler()
scheduler.add_job(run_deadline_check, trigger="cron", hour=8, minute=0,
                  id="deadline_check", replace_existing=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="LegalEase Tunisia API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path("uploads").mkdir(exist_ok=True)

app.include_router(auth.router,          prefix="/api/v1")
app.include_router(procedure.router,     prefix="/api/v1")
app.include_router(documents.router,     prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(admin.router,         prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(collaboration.router, prefix="/api/v1")




@app.get("/")
def root():
    return {"message": "Welcome to the LegalEase Tunisia API"}


@app.middleware("http")
async def log_requests(request, call_next):
    print(f"  {request.method} {request.url.path}")
    response = await call_next(request)
    return response

@app.get("/api/v1/test-email")
def test_email():
    from app.services.email import send_deadline_reminder
    send_deadline_reminder(
        to_email       = "ghouiliwiem013@gmail.com",  # ← ton email
        username       = "Test",
        step_title     = "Inscription RNE",
        procedure_name = "Création d'entreprise",
        days_remaining = 3,
        due_date       = "2026-05-15",
    )
    return {"status": "sent"}