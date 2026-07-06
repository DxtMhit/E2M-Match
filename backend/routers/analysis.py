"""
Analysis router — handles resume + JD upload and streams analysis progress via SSE.
"""

import json
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional

from config import get_settings
from models.schemas import ProgressEvent, StepStatus, AnalysisResult
from services.file_parser import parse_file
from services.gemini_service import extract_profile, compare_and_score

router = APIRouter(prefix="/api", tags=["analysis"])


def _sse_event(event_type: str, data: dict) -> str:
    """Format a Server-Sent Event."""
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


def _progress_event(step: str, status: StepStatus, message: str, data: dict = None) -> str:
    """Create a progress SSE event."""
    event = ProgressEvent(step=step, status=status, message=message, data=data)
    return _sse_event("progress", event.model_dump())


@router.post("/analyze")
async def analyze_match(
    resume: UploadFile = File(..., description="Resume file (PDF, DOCX, or TXT)"),
    jd_file: Optional[UploadFile] = File(None, description="JD file (PDF, DOCX, or TXT)"),
    jd_text: Optional[str] = Form(None, description="JD as plain text"),
):
    """
    Analyze a resume against a job description.

    Accepts resume as a file upload and JD as either a file upload or plain text.
    Returns Server-Sent Events (SSE) stream with real-time progress updates.
    """
    settings = get_settings()

    # Validate inputs
    if not jd_file and not jd_text:
        raise HTTPException(status_code=400, detail="Either jd_file or jd_text must be provided")

    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured")

    # Validate file sizes
    resume_bytes = await resume.read()
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(resume_bytes) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"Resume file exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
        )

    jd_bytes = None
    jd_filename = None
    if jd_file:
        jd_bytes = await jd_file.read()
        jd_filename = jd_file.filename
        if len(jd_bytes) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"JD file exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
            )

    async def event_generator():
        """Generate SSE events as the analysis progresses."""
        try:
            # Step 1: Parsing documents
            yield _progress_event("parsing", StepStatus.IN_PROGRESS, "Extracting text from your documents...")
            await asyncio.sleep(0.5)  # Small delay for UX

            try:
                resume_text = parse_file(resume_bytes, resume.filename)
            except ValueError as e:
                yield _progress_event("parsing", StepStatus.ERROR, f"Resume parsing failed: {str(e)}")
                yield _sse_event("error", {"message": str(e)})
                return
            except Exception as e:
                yield _progress_event("parsing", StepStatus.ERROR, f"Resume parsing failed: {str(e)}")
                yield _sse_event("error", {"message": f"Failed to parse resume: {str(e)}"})
                return

            if jd_bytes and jd_filename:
                try:
                    jd_content = parse_file(jd_bytes, jd_filename)
                except ValueError as e:
                    yield _progress_event("parsing", StepStatus.ERROR, f"JD parsing failed: {str(e)}")
                    yield _sse_event("error", {"message": str(e)})
                    return
                except Exception as e:
                    yield _progress_event("parsing", StepStatus.ERROR, f"JD parsing failed: {str(e)}")
                    yield _sse_event("error", {"message": f"Failed to parse JD: {str(e)}"})
                    return
            else:
                jd_content = jd_text

            if not resume_text.strip():
                yield _progress_event("parsing", StepStatus.ERROR, "Resume appears to be empty")
                yield _sse_event("error", {"message": "Could not extract text from the resume file"})
                return

            if not jd_content.strip():
                yield _progress_event("parsing", StepStatus.ERROR, "Job description appears to be empty")
                yield _sse_event("error", {"message": "Job description is empty"})
                return

            yield _progress_event("parsing", StepStatus.COMPLETED, "Documents parsed successfully")
            await asyncio.sleep(0.3)

            # Step 2: Extracting skills
            yield _progress_event("extracting", StepStatus.IN_PROGRESS, "AI is identifying skills and qualifications...")

            try:
                resume_profile = await extract_profile(resume_text, "resume")
            except Exception as e:
                yield _progress_event("extracting", StepStatus.ERROR, f"Failed to extract resume skills: {str(e)}")
                yield _sse_event("error", {"message": f"AI skill extraction failed for resume: {str(e)}"})
                return

            try:
                jd_profile = await extract_profile(jd_content, "job_description")
            except Exception as e:
                yield _progress_event("extracting", StepStatus.ERROR, f"Failed to extract JD skills: {str(e)}")
                yield _sse_event("error", {"message": f"AI skill extraction failed for JD: {str(e)}"})
                return

            yield _progress_event(
                "extracting",
                StepStatus.COMPLETED,
                f"Extracted {len(resume_profile.skills)} resume skills, {len(jd_profile.skills)} JD requirements",
            )
            await asyncio.sleep(0.3)

            # Step 3: Comparing profiles
            yield _progress_event("comparing", StepStatus.IN_PROGRESS, "Matching resume skills against JD requirements...")

            # Step 4: Computing score (merged with comparing for Gemini call efficiency)
            try:
                analysis_result = await compare_and_score(
                    resume_text, jd_content, resume_profile, jd_profile
                )
            except Exception as e:
                yield _progress_event("comparing", StepStatus.ERROR, f"Comparison failed: {str(e)}")
                yield _sse_event("error", {"message": f"AI comparison failed: {str(e)}"})
                return

            yield _progress_event("comparing", StepStatus.COMPLETED, "Profile comparison complete")
            await asyncio.sleep(0.3)

            yield _progress_event("scoring", StepStatus.IN_PROGRESS, "Calculating match score and verdict...")
            await asyncio.sleep(0.5)
            yield _progress_event(
                "scoring",
                StepStatus.COMPLETED,
                f"Score: {analysis_result.score}/100 — {analysis_result.verdict.value}",
            )
            await asyncio.sleep(0.3)

            # Step 5: Generating report
            yield _progress_event("generating_report", StepStatus.IN_PROGRESS, "Preparing your detailed analysis report...")
            await asyncio.sleep(0.5)
            yield _progress_event("generating_report", StepStatus.COMPLETED, "Report ready!")

            # Final result event
            yield _sse_event("result", {
                "success": True,
                "result": analysis_result.model_dump(),
            })

        except Exception as e:
            yield _sse_event("error", {"message": f"An unexpected error occurred: {str(e)}"})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
