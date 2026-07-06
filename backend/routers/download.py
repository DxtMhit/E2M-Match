"""
Download router — generates ZIP bundles with resume, JD, and PDF report.
"""

import io
import zipfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional

from models.schemas import AnalysisResult
from services.report_generator import generate_report_pdf
import json

router = APIRouter(prefix="/api", tags=["download"])


@router.post("/report/download")
async def download_report(
    resume: UploadFile = File(..., description="Original resume file"),
    jd_file: Optional[UploadFile] = File(None, description="Original JD file"),
    jd_text: Optional[str] = Form(None, description="JD as plain text"),
    analysis_json: str = Form(..., description="Analysis result JSON"),
):
    """
    Generate and download a ZIP bundle containing:
    1. Original resume file
    2. Original JD file (or JD as .txt if text was used)
    3. PDF analysis report

    The analysis result is passed as JSON from the frontend.
    """
    try:
        analysis_data = json.loads(analysis_json)
        analysis_result = AnalysisResult(**analysis_data)
    except (json.JSONDecodeError, Exception) as e:
        raise HTTPException(status_code=400, detail=f"Invalid analysis data: {str(e)}")

    # Read uploaded files
    resume_bytes = await resume.read()
    resume_filename = resume.filename or "resume"

    jd_bytes = None
    jd_filename = "job_description.txt"
    if jd_file:
        jd_bytes = await jd_file.read()
        jd_filename = jd_file.filename or "job_description"
    elif jd_text:
        jd_bytes = jd_text.encode("utf-8")
        jd_filename = "job_description.txt"

    # Generate PDF report
    try:
        report_pdf = generate_report_pdf(analysis_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

    # Create ZIP bundle
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add resume
        zf.writestr(f"1_Resume_{resume_filename}", resume_bytes)

        # Add JD
        if jd_bytes:
            zf.writestr(f"2_JobDescription_{jd_filename}", jd_bytes)

        # Add report
        candidate_name = analysis_result.candidate_name or "Candidate"
        safe_name = "".join(c for c in candidate_name if c.isalnum() or c in (" ", "-", "_")).strip()
        report_name = f"3_MatchReport_{safe_name}.pdf"
        zf.writestr(report_name, report_pdf)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="E2M_Match_Report_{safe_name}.zip"',
        },
    )
