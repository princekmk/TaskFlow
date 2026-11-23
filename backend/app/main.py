from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.tasks import router as tasks_router
from .routers.auth import router as auth_router

app = FastAPI(
    title="TaskFlow API",
    description="API менеджера задач",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршруты авторизации
app.include_router(auth_router)
app.include_router(tasks_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to TaskFlow API",
        "status": "running",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
    }