from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.v1.endpoints import auth

app = FastAPI(title="AI/BI Project API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["*"] en développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routage
app.include_router(auth.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to the AI/BI API"}

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response