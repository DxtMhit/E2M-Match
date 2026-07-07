"""
PDF report generator — creates E2M-branded analysis reports using ReportLab.
"""

import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.graphics.shapes import Drawing, Circle, String, Rect
from reportlab.graphics.charts.piecharts import Pie
from models.schemas import AnalysisResult, Verdict


# E2M Brand Colors
E2M_BLACK = colors.HexColor("#000000")
E2M_DARK = colors.HexColor("#1A1A2E")
E2M_BLUE = colors.HexColor("#3B5BFE")
E2M_ORANGE = colors.HexColor("#E8712B")
E2M_WHITE = colors.HexColor("#FFFFFF")
E2M_GRAY = colors.HexColor("#A0A0B0")
E2M_LIGHT_BG = colors.HexColor("#F5F5F7")
E2M_GREEN = colors.HexColor("#22C55E")
E2M_RED = colors.HexColor("#EF4444")


def _get_verdict_color(verdict: Verdict) -> colors.HexColor:
    """Return color based on verdict level."""
    mapping = {
        Verdict.STRONG_FIT: E2M_GREEN,
        Verdict.GOOD_FIT: colors.HexColor("#4ADE80"),
        Verdict.MODERATE_FIT: E2M_ORANGE,
        Verdict.WEAK_FIT: colors.HexColor("#F97316"),
        Verdict.NOT_A_FIT: E2M_RED,
    }
    return mapping.get(verdict, E2M_ORANGE)


def _create_styles() -> dict:
    """Create custom paragraph styles for the report."""
    base = getSampleStyleSheet()

    styles = {
        "title": ParagraphStyle(
            "E2MTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            textColor=E2M_DARK,
            spaceAfter=6,
            alignment=TA_CENTER,
        ),
        "subtitle": ParagraphStyle(
            "E2MSubtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=12,
            textColor=E2M_GRAY,
            spaceAfter=20,
            alignment=TA_CENTER,
        ),
        "heading": ParagraphStyle(
            "E2MHeading",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=E2M_DARK,
            spaceBefore=20,
            spaceAfter=10,
            borderPadding=(0, 0, 4, 0),
        ),
        "subheading": ParagraphStyle(
            "E2MSubheading",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=E2M_BLUE,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "E2MBody",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=E2M_BLACK,
            spaceAfter=6,
            leading=14,
        ),
        "body_bold": ParagraphStyle(
            "E2MBodyBold",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=E2M_BLACK,
            spaceAfter=6,
        ),
        "score": ParagraphStyle(
            "E2MScore",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=48,
            textColor=E2M_BLUE,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "verdict": ParagraphStyle(
            "E2MVerdict",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=20,
        ),
        "footer": ParagraphStyle(
            "E2MFooter",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=E2M_GRAY,
            alignment=TA_CENTER,
        ),
        "skill_matched": ParagraphStyle(
            "SkillMatched",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=colors.HexColor("#166534"),
        ),
        "skill_missing": ParagraphStyle(
            "SkillMissing",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=colors.HexColor("#991B1B"),
        ),
    }
    return styles


def generate_report_pdf(result: AnalysisResult) -> bytes:
    """
    Generate a branded PDF report from analysis results.

    Returns:
        PDF file content as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30 * mm,
        leftMargin=30 * mm,
        topMargin=25 * mm,
        bottomMargin=25 * mm,
    )

    styles = _create_styles()
    elements = []

    # --- Header with E2M branding ---
    header_data = [
        [
            Paragraph('<b><font color="#3B5BFE">E</font> 2 M</b>', ParagraphStyle(
                "Logo", fontName="Helvetica-Bold", fontSize=20, textColor=E2M_DARK
            )),
            Paragraph(
                f'<font size="8" color="#A0A0B0">Generated: {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</font>',
                ParagraphStyle("DateStyle", alignment=TA_RIGHT, fontName="Helvetica", fontSize=8),
            ),
        ]
    ]
    header_table = Table(header_data, colWidths=[3 * inch, 3.5 * inch])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, 0), "LEFT"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    elements.append(header_table)

    # Blue accent line
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=3, color=E2M_BLUE, spaceAfter=15))

    # --- Title ---
    elements.append(Paragraph("Resume-JD Match Report", styles["title"]))

    candidate_info = f"Candidate: {result.candidate_name or 'N/A'}"
    if result.job_title:
        candidate_info += f" &nbsp;|&nbsp; Position: {result.job_title}"
    elements.append(Paragraph(candidate_info, styles["subtitle"]))

    # --- Score Section ---
    verdict_color = _get_verdict_color(result.verdict)
    elements.append(Paragraph(f"{result.score}", styles["score"]))
    elements.append(Spacer(1, 10))  # Add space between score and verdict

    verdict_style = ParagraphStyle(
        "VerdictDynamic",
        parent=styles["verdict"],
        textColor=verdict_color,
    )
    elements.append(Paragraph(f"{result.verdict.value}", verdict_style))

    elements.append(HRFlowable(width="60%", thickness=1, color=E2M_LIGHT_BG, spaceAfter=15, spaceBefore=10))

    # --- Summary Stats ---
    stats_data = [
        [
            Paragraph(f'<b><font color="#3B5BFE">{len(result.matched_skills)}</font></b>', ParagraphStyle("Stat", alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=14)),
            Paragraph(f'<b><font color="#EF4444">{len(result.missing_skills)}</font></b>', ParagraphStyle("Stat", alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=14)),
            Paragraph(f'<b><font color="#E8712B">{result.resume_skills_count}</font></b>', ParagraphStyle("Stat", alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=14)),
            Paragraph(f'<b><font color="#E8712B">{result.jd_skills_count}</font></b>', ParagraphStyle("Stat", alignment=TA_CENTER, fontName="Helvetica-Bold", fontSize=14)),
        ],
        [
            Paragraph("Skills Matched", ParagraphStyle("StatLabel", alignment=TA_CENTER, fontName="Helvetica", fontSize=8, textColor=E2M_GRAY)),
            Paragraph("Skills Missing", ParagraphStyle("StatLabel", alignment=TA_CENTER, fontName="Helvetica", fontSize=8, textColor=E2M_GRAY)),
            Paragraph("Resume Skills", ParagraphStyle("StatLabel", alignment=TA_CENTER, fontName="Helvetica", fontSize=8, textColor=E2M_GRAY)),
            Paragraph("JD Skills", ParagraphStyle("StatLabel", alignment=TA_CENTER, fontName="Helvetica", fontSize=8, textColor=E2M_GRAY)),
        ],
    ]
    stats_table = Table(stats_data, colWidths=[1.6 * inch] * 4)
    stats_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), E2M_LIGHT_BG),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
        ("TOPPADDING", (0, 0), (-1, 0), 12),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 12),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 20))

    # --- Explanation ---
    elements.append(Paragraph("Analysis Summary", styles["heading"]))
    elements.append(HRFlowable(width="100%", thickness=1, color=E2M_BLUE, spaceAfter=10))
    
    # Split explanation by newline to render as list elements
    lines = [line.strip() for line in result.explanation.split('\n') if line.strip()]
    for line in lines:
        cleaned_line = line.lstrip('•-* \t')
        if cleaned_line:
            bullet_style = ParagraphStyle(
                "ExplanationBullet",
                parent=styles["body"],
                leftIndent=15,
                firstLineIndent=-10,
                spaceAfter=4,
            )
            elements.append(Paragraph(f"• &nbsp; {cleaned_line}", bullet_style))
    elements.append(Spacer(1, 10))

    # --- Matched Skills ---
    if result.matched_skills:
        elements.append(Paragraph("✅ Matched Skills", styles["heading"]))
        elements.append(HRFlowable(width="100%", thickness=1, color=E2M_GREEN, spaceAfter=10))

        matched_header = [
            Paragraph("<b>Skill</b>", styles["body_bold"]),
            Paragraph("<b>Match Type</b>", styles["body_bold"]),
            Paragraph("<b>Category</b>", styles["body_bold"]),
            Paragraph("<b>Confidence</b>", styles["body_bold"]),
        ]
        matched_rows = [matched_header]
        for skill in result.matched_skills:
            matched_rows.append([
                Paragraph(skill.name, styles["skill_matched"]),
                Paragraph(skill.match_type.value.capitalize(), styles["body"]),
                Paragraph(skill.category, styles["body"]),
                Paragraph(f"{int(skill.confidence * 100)}%", styles["body"]),
            ])

        matched_table = Table(matched_rows, colWidths=[2 * inch, 1.3 * inch, 1.7 * inch, 1 * inch])
        matched_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCFCE7")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#166534")),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [E2M_WHITE, E2M_LIGHT_BG]),
        ]))
        elements.append(matched_table)
        elements.append(Spacer(1, 15))

    # --- Missing Skills ---
    if result.missing_skills:
        elements.append(Paragraph("❌ Missing Skills", styles["heading"]))
        elements.append(HRFlowable(width="100%", thickness=1, color=E2M_RED, spaceAfter=10))

        missing_header = [
            Paragraph("<b>Skill</b>", styles["body_bold"]),
            Paragraph("<b>Importance</b>", styles["body_bold"]),
            Paragraph("<b>Category</b>", styles["body_bold"]),
        ]
        missing_rows = [missing_header]
        for skill in result.missing_skills:
            importance_color = "#991B1B" if skill.importance.value == "must-have" else "#92400E"
            missing_rows.append([
                Paragraph(skill.name, styles["skill_missing"]),
                Paragraph(
                    f'<font color="{importance_color}"><b>{skill.importance.value.upper()}</b></font>',
                    styles["body"],
                ),
                Paragraph(skill.category, styles["body"]),
            ])

        missing_table = Table(missing_rows, colWidths=[2.5 * inch, 1.8 * inch, 1.7 * inch])
        missing_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#FEE2E2")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#991B1B")),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [E2M_WHITE, colors.HexColor("#FFF5F5")]),
        ]))
        elements.append(missing_table)
        elements.append(Spacer(1, 15))

    # --- Suggestions ---
    if result.suggestions:
        elements.append(Paragraph("💡 Improvement Suggestions", styles["heading"]))
        elements.append(HRFlowable(width="100%", thickness=1, color=E2M_ORANGE, spaceAfter=10))
        for i, suggestion in enumerate(result.suggestions, 1):
            elements.append(Paragraph(f"<b>{i}.</b> {suggestion}", styles["body"]))
        elements.append(Spacer(1, 20))

    # --- Footer ---
    elements.append(HRFlowable(width="100%", thickness=1, color=E2M_LIGHT_BG, spaceAfter=10, spaceBefore=20))
    elements.append(Paragraph(
        f"Generated by E2M Resume-JD Matching Tool | © {datetime.now().year} E2M Solutions. All Rights Reserved.",
        styles["footer"],
    ))
    elements.append(Paragraph(
        "This report is generated using AI-powered analysis and should be used as a supplementary tool in the hiring process.",
        styles["footer"],
    ))

    # Build the PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
