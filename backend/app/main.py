from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.compare import router as compare_router
from app.api.insights import router as insights_router
from app.api.market import router as market_router
from app.api.ml import router as ml_router
from app.api.news import router as news_router
from app.api.portfolio import router as portfolio_router
from app.api.stocks import router as stocks_router
from app.api.watchlist import router as watchlist_router
from app.core.config import settings
from app.database.init_db import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    logger.info("Initializing database tables...")
    init_db()
    logger.info("FinSight backend started successfully.")
    yield
    # Shutdown
    logger.info("FinSight backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Comprehensive Financial Analytics, AI Insights & Portfolio Intelligence Platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected",
    }


@app.get("/", tags=["System"])
def root():
    """Root entrypoint providing API metadata and documentation link."""
    return {
        "project": settings.PROJECT_NAME,
        "status": "active",
        "documentation": f"{settings.API_V1_STR}/docs",
    }


# Include all API Routers under /api prefix
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(stocks_router, prefix=api_prefix)
app.include_router(market_router, prefix=api_prefix)
app.include_router(portfolio_router, prefix=api_prefix)
app.include_router(watchlist_router, prefix=api_prefix)
app.include_router(compare_router, prefix=api_prefix)
app.include_router(insights_router, prefix=api_prefix)
app.include_router(ml_router, prefix=api_prefix)
app.include_router(news_router, prefix=api_prefix)
