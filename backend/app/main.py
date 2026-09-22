"""
FastAPI Application Entrypoint for Cognitio Libera.

WHAT IT IS:
    This is the main application server module that initializes the FastAPI application,
    configures CORS, wires up the database lifespan bootstrap, registers exception
    handlers, and mounts the `/api/v1` routes.

WHY WE USE IT:
    FastAPI provides an asynchronous, high-performance web framework with automatic
    OpenAPI / Swagger documentation, Pydantic validation, and dependency injection.

HOW IT CONNECTS:
    Uvicorn binds to this application:
    `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine
from app.db.init_db import initialize_database
from app.api.v1.router import api_v1_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cognitio_libera")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager that handles startup and shutdown events.

    Startup:
        Initializes the database schema and seeds curriculum content.
    Shutdown:
        Disposes of database connection pools cleanly.
    """
    logger.info("Initializing Cognitio Libera backend...")
    try:
        initialize_database()
        logger.info("Database and curriculum ready.")
    except Exception as exc:
        logger.error(f"Startup database initialization error: {str(exc)}")

    yield

    logger.info("Shutting down Cognitio Libera backend...")
    engine.dispose()


# Instantiate FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cognitio Libera - Practice. Understand. Improve. AI-powered coding and learning platform.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Cross-Origin Resource Sharing (CORS)
# Supports local Vite frontend and Render static sites
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Liveness and readiness health check probe for Render and load balancers.

    Returns:
        Dict: Service status and version.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Mount V1 API routes
app.include_router(api_v1_router, prefix="/api/v1")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches unhandled exceptions, logs them securely, and returns a clean user-friendly JSON error.

    Security:
        Internal stack traces and secrets are NEVER exposed to the API consumer.
    """
    logger.error(f"Unhandled exception on {request.method} {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again shortly."}
    )
