from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.database.session import engine, SessionLocal, Base

# Import all models to ensure they are registered
from app.models import *

from app.api.routes import auth, dashboard, crm, vendas, estoque, financeiro, projetos, search, rh
from app.database.seeds import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 Iniciando {settings.APP_NAME} v{settings.APP_VERSION}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown
    print("👋 Encerrando servidor...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema ERP Empresarial Moderno — API REST",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(crm.router, prefix=API_PREFIX)
app.include_router(vendas.router, prefix=API_PREFIX)
app.include_router(estoque.router, prefix=API_PREFIX)
app.include_router(financeiro.router, prefix=API_PREFIX)
app.include_router(projetos.router, prefix=API_PREFIX)
app.include_router(search.router, prefix=API_PREFIX)
app.include_router(rh.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
