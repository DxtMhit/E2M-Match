"""
Gemini AI service — skill extraction, comparison, and scoring using Gemini 2.0 Flash.
"""

import json
from typing import Optional
from google import genai
from pydantic import BaseModel, Field
from config import get_settings
from models.schemas import (
    ExtractedProfile,
    ExtractedSkill,
    AnalysisResult,
    MatchedSkill,
    MissingSkill,
    Verdict,
    SkillImportance,
    MatchType,
)

# Initialize the Gemini client
_client = None


def _get_client() -> genai.Client:
    """Lazily initialize and return the Gemini client."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def _call_gemini(prompt: str, response_schema=None) -> str:
    """Send a prompt to Gemini and return the text response (optionally structured JSON)."""
    settings = get_settings()
    client = _get_client()
    
    max_tokens = settings.MODEL_MAX_TOKENS
    if not max_tokens or max_tokens < 4000:
        max_tokens = 8192

    config_params = {
        "temperature": settings.MODEL_TEMPERATURE,
        "max_output_tokens": max_tokens,
    }
    
    if response_schema is not None:
        config_params["response_mime_type"] = "application/json"
        config_params["response_schema"] = response_schema

    response = client.models.generate_content(
        model=settings.MODEL_NAME,
        contents=prompt,
        config=genai.types.GenerateContentConfig(**config_params),
    )
    
    try:
        if response.candidates and len(response.candidates) > 0:
            finish_reason = response.candidates[0].finish_reason
            if finish_reason and finish_reason != "STOP":
                print(f"WARNING: Gemini finished with reason: {finish_reason}. Max tokens used: {max_tokens}")
    except Exception as e:
        print(f"DEBUG: Could not parse finish_reason: {str(e)}")

    return response.text


async def extract_profile(text: str, source_type: str) -> ExtractedProfile:
    """
    Extract skills, experience, and qualifications from resume or JD text.

    Args:
        text: The raw text content
        source_type: Either "resume" or "job_description"

    Returns:
        ExtractedProfile with structured skill data
    """
    prompt = f"""You are an expert HR analyst. Analyze the following {source_type} and extract structured information.

{"RESUME" if source_type == "resume" else "JOB DESCRIPTION"} TEXT:
---
{text}
---

Rules:
- Extract ALL technical and soft skills mentioned
- For a {source_type}, {"infer proficiency from context (years used, project complexity)" if source_type == "resume" else "set proficiency to null"}
- Categorize each skill accurately
- Be thorough — don't miss any skills
"""

    response_text = _call_gemini(prompt, response_schema=ExtractedProfile)

    # Clean the response — remove markdown code blocks if present
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines)

    try:
        try:
            return ExtractedProfile.model_validate_json(cleaned)
        except AttributeError:
            return ExtractedProfile.parse_raw(cleaned)
    except Exception as validation_err:
        # Fallback: try parsing as generic JSON dictionary to extract fields manually
        try:
            start = cleaned.find("{")
            end = cleaned.rfind("}") + 1
            json_str = cleaned[start:end] if (start != -1 and end > start) else cleaned
            data = json.loads(json_str)
            
            skills = []
            for s in data.get("skills", []):
                if isinstance(s, dict) and "name" in s:
                    skills.append(ExtractedSkill(
                        name=str(s["name"]),
                        category=str(s.get("category", "General")),
                        proficiency=str(s.get("proficiency")) if s.get("proficiency") else None
                    ))
            
            exp = data.get("experience_years")
            if exp is not None:
                try:
                    exp = float(exp)
                except (ValueError, TypeError):
                    exp = None

            return ExtractedProfile(
                skills=skills,
                experience_years=exp,
                qualifications=[str(q) for q in data.get("qualifications", []) if q],
                job_title=str(data.get("job_title")) if data.get("job_title") else None,
                summary=str(data.get("summary", ""))
            )
        except Exception:
            raise ValueError(f"Failed to parse Gemini response as JSON: {response_text[:200]}. Validation error: {str(validation_err)}")


# --- Schema definitions for Structured Gemini Comparison Output ---

class GeminiMatchedSkill(BaseModel):
    name: str = Field(..., description="Name of the matched skill")
    match_type: str = Field(..., description="exact or semantic")
    confidence: float = Field(..., description="Match confidence score between 0.0 and 1.0")
    category: str = Field(default="General", description="Category of the skill")


class GeminiMissingSkill(BaseModel):
    name: str = Field(..., description="Name of the missing skill from JD")
    importance: str = Field(..., description="must-have or nice-to-have")
    category: str = Field(default="General", description="Category of the skill")


class GeminiComparisonResult(BaseModel):
    score: int = Field(..., description="Match score between 0 and 100")
    verdict: str = Field(..., description="One of: Strong Fit, Good Fit, Moderate Fit, Weak Fit, Not a Fit")
    matched_skills: list[GeminiMatchedSkill] = Field(default_factory=list)
    missing_skills: list[GeminiMissingSkill] = Field(default_factory=list)
    explanation: str = Field(..., description="Exactly 3 to 4 concise bullet points summarizing the match results (strengths, gaps, fit suitability). Format each point on a new line starting with a bullet '• '.")
    suggestions: list[str] = Field(default_factory=list, description="Actionable suggestions for candidate improvement")
    candidate_name: Optional[str] = Field(default=None, description="Extracted candidate name or null")
    job_title_matched: Optional[str] = Field(default=None, description="Job title matched or target job title from JD")


async def compare_and_score(
    resume_text: str,
    jd_text: str,
    resume_profile: ExtractedProfile,
    jd_profile: ExtractedProfile,
) -> AnalysisResult:
    """
    Compare resume and JD profiles, compute match score, and generate analysis.

    Uses Gemini for semantic comparison and narrative generation.
    """
    resume_skills_str = ", ".join(s.name for s in resume_profile.skills)
    jd_skills_str = ", ".join(s.name for s in jd_profile.skills)

    prompt = f"""You are an expert HR analyst and recruiter. Compare this resume against the job description and provide a detailed matching analysis.

RESUME SUMMARY: {resume_profile.summary}
RESUME SKILLS: {resume_skills_str}
RESUME EXPERIENCE: {resume_profile.experience_years or "Not specified"} years
RESUME QUALIFICATIONS: {", ".join(resume_profile.qualifications) or "Not specified"}

JOB DESCRIPTION SUMMARY: {jd_profile.summary}
JOB DESCRIPTION REQUIRED SKILLS: {jd_skills_str}
JOB DESCRIPTION QUALIFICATIONS: {", ".join(jd_profile.qualifications) or "Not specified"}

FULL RESUME TEXT:
---
{resume_text[:3000]}
---

FULL JD TEXT:
---
{jd_text[:3000]}
---

SCORING GUIDELINES:
- Score 85-100 (Strong Fit): Candidate meets almost all must-have requirements and most nice-to-haves
- Score 70-84 (Good Fit): Candidate meets most must-have requirements
- Score 50-69 (Moderate Fit): Candidate meets some must-have requirements, has transferable skills
- Score 30-49 (Weak Fit): Candidate meets few requirements, significant skill gaps
- Score 0-29 (Not a Fit): Candidate lacks most required skills

IMPORTANT RULES:
- Set match_type to "exact" when the skill name closely matches, "semantic" when the candidate has an equivalent/related skill
- Set importance to "must-have" for core/essential requirements, "nice-to-have" for preferred/bonus skills
- For 'explanation', provide EXACTLY 3 to 4 concise bullet points summarizing the match result (such as overall fit, strengths, major gaps). Format each point on a new line starting with a bullet '• '. Do not write a continuous narrative paragraph.
"""

    response_text = _call_gemini(prompt, response_schema=GeminiComparisonResult)

    # Clean the response
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines)

    try:
        try:
            comparison = GeminiComparisonResult.model_validate_json(cleaned)
        except AttributeError:
            comparison = GeminiComparisonResult.parse_raw(cleaned)
    except Exception as validation_err:
        # Fallback: try parsing as generic JSON dictionary to extract fields manually
        try:
            start = cleaned.find("{")
            end = cleaned.rfind("}") + 1
            json_str = cleaned[start:end] if (start != -1 and end > start) else cleaned
            data = json.loads(json_str)
            
            matched_skills = []
            for s in data.get("matched_skills", []):
                if isinstance(s, dict) and "name" in s:
                    matched_skills.append(GeminiMatchedSkill(
                        name=str(s["name"]),
                        match_type=str(s.get("match_type", "exact")),
                        confidence=float(s.get("confidence", 1.0)) if s.get("confidence") is not None else 1.0,
                        category=str(s.get("category", "General"))
                    ))
                    
            missing_skills = []
            for s in data.get("missing_skills", []):
                if isinstance(s, dict) and "name" in s:
                    missing_skills.append(GeminiMissingSkill(
                        name=str(s["name"]),
                        importance=str(s.get("importance", "nice-to-have")),
                        category=str(s.get("category", "General"))
                    ))
                    
            comparison = GeminiComparisonResult(
                score=int(data.get("score", 50)) if data.get("score") is not None else 50,
                verdict=str(data.get("verdict", "Moderate Fit")),
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                explanation=str(data.get("explanation", "")),
                suggestions=[str(s) for s in data.get("suggestions", [])],
                candidate_name=str(data.get("candidate_name")) if data.get("candidate_name") else None,
                job_title_matched=str(data.get("job_title_matched")) if data.get("job_title_matched") else None
            )
        except Exception:
            raise ValueError(f"Failed to parse Gemini comparison response: {response_text[:200]}. Validation error: {str(validation_err)}")

    # Map verdict string to enum
    verdict_map = {
        "Strong Fit": Verdict.STRONG_FIT,
        "Good Fit": Verdict.GOOD_FIT,
        "Moderate Fit": Verdict.MODERATE_FIT,
        "Weak Fit": Verdict.WEAK_FIT,
        "Not a Fit": Verdict.NOT_A_FIT,
        "Not a fit": Verdict.NOT_A_FIT,
        "Not A Fit": Verdict.NOT_A_FIT,
    }
    verdict = verdict_map.get(comparison.verdict, Verdict.MODERATE_FIT)

    # Build matched skills
    matched_skills = []
    for s in comparison.matched_skills:
        mt = MatchType.SEMANTIC if s.match_type == "semantic" else MatchType.EXACT
        matched_skills.append(MatchedSkill(
            name=s.name,
            match_type=mt,
            confidence=s.confidence,
            category=s.category or "General",
        ))

    # Build missing skills
    missing_skills = []
    for s in comparison.missing_skills:
        imp = SkillImportance.MUST_HAVE if s.importance == "must-have" else SkillImportance.NICE_TO_HAVE
        missing_skills.append(MissingSkill(
            name=s.name,
            importance=imp,
            category=s.category or "General",
        ))

    return AnalysisResult(
        score=max(0, min(100, comparison.score)),
        verdict=verdict,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        resume_skills_count=len(resume_profile.skills),
        jd_skills_count=len(jd_profile.skills),
        explanation=comparison.explanation,
        suggestions=comparison.suggestions,
        resume_summary=resume_profile.summary,
        jd_summary=jd_profile.summary,
        candidate_name=comparison.candidate_name,
        job_title=comparison.job_title_matched or jd_profile.job_title,
    )
