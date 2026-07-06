"""
E2M Resume-JD Matching Tool — FastAPI Backend
Main application entry point.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import analysis, download

settings = get_settings()

app = FastAPI(
    title="E2M Resume-JD Matching Tool API",
    description="AI-powered resume screening and job description matching tool by E2M Solutions.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware — allow frontend origin
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router)
app.include_router(download.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint for Railway and monitoring."""
    return {
        "status": "ok",
        "service": "E2M Resume-JD Matching Tool API",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
