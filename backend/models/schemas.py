from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# --- Enums ---

class Verdict(str, Enum):
    STRONG_FIT = "Strong Fit"
    GOOD_FIT = "Good Fit"
    MODERATE_FIT = "Moderate Fit"
    WEAK_FIT = "Weak Fit"
    NOT_A_FIT = "Not a Fit"


class SkillImportance(str, Enum):
    MUST_HAVE = "must-have"
    NICE_TO_HAVE = "nice-to-have"


class MatchType(str, Enum):
    EXACT = "exact"
    SEMANTIC = "semantic"


class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ERROR = "error"


# --- Skill Models ---

class ExtractedSkill(BaseModel):
    """A single skill extracted from a resume or JD."""
    name: str = Field(..., description="Skill name")
    category: str = Field(default="General", description="Category like Programming, Framework, Soft Skill, etc.")
    proficiency: Optional[str] = Field(default=None, description="Proficiency level if detectable from resume")


class ExtractedProfile(BaseModel):
    """Structured data extracted from a resume or JD."""
    skills: list[ExtractedSkill] = Field(default_factory=list)
    experience_years: Optional[float] = Field(default=None, description="Total years of experience")
    qualifications: list[str] = Field(default_factory=list, description="Degrees, certifications, etc.")
    job_title: Optional[str] = Field(default=None, description="Current/target job title")
    summary: str = Field(default="", description="Brief summary of the profile/JD")


# --- Match Result Models ---

class MatchedSkill(BaseModel):
    """A skill that matched between resume and JD."""
    name: str
    match_type: MatchType = Field(default=MatchType.EXACT)
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    category: str = Field(default="General")


class MissingSkill(BaseModel):
    """A skill from the JD missing in the resume."""
    name: str
    importance: SkillImportance = Field(default=SkillImportance.NICE_TO_HAVE)
    category: str = Field(default="General")


class AnalysisResult(BaseModel):
    """Complete analysis result from the matching engine."""
    score: int = Field(..., ge=0, le=100, description="Match score 0-100")
    verdict: Verdict
    matched_skills: list[MatchedSkill] = Field(default_factory=list)
    missing_skills: list[MissingSkill] = Field(default_factory=list)
    resume_skills_count: int = Field(default=0)
    jd_skills_count: int = Field(default=0)
    explanation: str = Field(default="", description="Narrative explanation of the match")
    suggestions: list[str] = Field(default_factory=list, description="Improvement suggestions for the candidate")
    resume_summary: str = Field(default="")
    jd_summary: str = Field(default="")
    candidate_name: Optional[str] = Field(default=None)
    job_title: Optional[str] = Field(default=None)


# --- SSE Progress Models ---

class ProgressEvent(BaseModel):
    """A progress event sent via SSE during analysis."""
    step: str
    status: StepStatus
    message: str
    data: Optional[dict] = None


# --- API Response Models ---

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "E2M Resume-JD Matching Tool API"
    version: str = "1.0.0"


class AnalysisResponse(BaseModel):
    """Final analysis response."""
    success: bool
    result: Optional[AnalysisResult] = None
    error: Optional[str] = None
