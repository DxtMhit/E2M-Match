# 📄 E2M Resume-JD Matching Tool — Project Portfolio

Welcome to the comprehensive project documentation for the **E2M Resume-JD Matching Tool**. This project was developed as a modern, premium, AI-driven recruitment assistant built to optimize candidate screening, skill matching, and gap analysis with maximum speed and visual excellence.

---

## 🔗 Project Links & Resources
*   **GitHub Repository**: [https://github.com/DxtMhit/E2M-Match](https://github.com/DxtMhit/E2M-Match)
*   **Live Deployed Application**: [https://e2m-match.up.railway.app](https://e2m-match.up.railway.app) *(Note: Please substitute with your specific custom domain or live host endpoint if applicable)*
*   **Video Walkthrough**: Located in this repository at [`assets/demo.mp4`](file:///c:/Users/Mohit/Desktop/E2M-Match/assets/demo.mp4)

---

## 🎯 1. Problem Statement
Recruitment is one of the most time-consuming and critical bottlenecks in modern organizations. Hiring managers and HR professionals face several key pain points:
1. **High Volume, Low Quality Screening**: A single job posting can attract hundreds or thousands of resumes. Standard screening is manual, leading to fatigue, oversight, and bias.
2. **Limitations of Keyword-Based ATS**: Traditional Applicant Tracking Systems (ATS) rely on exact keyword matches. If a job description asks for `"Golang"` but the resume states `"Go Developer"`, or if the job specifies `"React.js"` and the candidate writes `"ReactJS"`, traditional filters fail. This disqualifies qualified candidates while passing less-suited candidates who keyword-stuff their profiles.
3. **Lack of Meaningful Gap Analysis**: Even if a resume matches some parts of a job, recruiters struggle to quickly identify *what is missing* and *how critical* the missing items are. A candidate missing a "Must-Have" skill is different from one missing a "Nice-to-Have" skill.
4. **Disorganized Candidate Records**: Recruiters must manage original resumes, job descriptions, and screening notes across separate systems, leading to a cluttered workflow.

### The Solution: E2M Resume-JD Matcher
This application solves these screening inefficiencies by leveraging **Google Gemini AI** and **Structured JSON Outputs** to:
*   Perform deep **semantic parsing** of skills and experience.
*   Identify **exact and semantic overlaps** between the candidate's profile and the job description.
*   Provide a clear, weighted **skill gap analysis** separating Must-Have and Nice-to-Have requirements.
*   Generate professional, branded **PDF Match Reports** and package them into a single-click downloadable **ZIP Bundle** for seamless sharing and recording.

---

## 📦 2. Deliverables
The project delivers a production-ready system with three core deliverables:

### A. The Interactive Web Tool (Frontend & Backend)
*   A responsive React-based user interface with premium branding, sleek CSS gradients, glassmorphism elements, and custom CSS styling (avoiding standard framework templates).
*   A real-time progress timeline driven by **Server-Sent Events (SSE)**, which shows recruiters the exact phase of AI processing (Parsing -> Extracting -> Comparing -> Scoring -> Report Generation).
*   A secure Python/FastAPI backend handling multi-format file parsing, structured Gemini prompts, and fast asynchronous execution.

### B. High-Fidelity Branded PDF Match Report
*   A dynamically generated PDF report compiled via **ReportLab** matching E2M's signature high-contrast professional color palette (Dark Navy, Mint/Aqua accent, and Crisp Slate).
*   Includes compatibility gauges, structured stats cards, visual skill matrices, missing skill warnings, and the AI's candidate suitability verdict.

### C. ZIP Export Bundle
*   A consolidated ZIP archive compiled in-memory and delivered to the recruiter's machine.
*   Contains:
    1. The candidate's original resume file (`[Candidate_Name]_Resume.[ext]`)
    2. The job description file (`Job_Description.txt` or `.docx` / `.pdf`)
    3. The generated high-fidelity matching report (`[Candidate_Name]_Match_Report.pdf`)

---

## 🌟 3. Key Features

| Feature | Description | Business Value |
| :--- | :--- | :--- |
| **Multi-Format Parsing** | Supports extracting text from `.pdf`, `.docx`, `.doc`, and `.txt` files on-the-fly. | Eliminates manual copy-pasting; handles all standard document formats. |
| **Real-Time SSE Streaming** | Uses Server-Sent Events to push progress updates from the backend to the frontend UI as steps complete. | Reduces perceived latency; provides immediate feedback during complex AI calls. |
| **AI Profile Extraction** | Structures raw text into structured JSON (skills, experience, target roles, qualifications). | Converts unstructured documents into clean, standardized database-ready records. |
| **Semantic Skills Matcher** | Compares candidate skills with JD requirements, mapping them into *Exact*, *Semantic*, or *No Match*. | Identifies matching capabilities even if candidate/employer use different terminology. |
| **Smart Gap Identification** | Pinpoints missing skills and classifies them as *Must-Have* or *Nice-to-Have*. | Allows recruiters to instantly see deal-breakers vs. minor skill gaps. |
| **AI Fit Verdict & Scoring** | Computes a compatibility percentage (0–100%) and categorizes the candidate (Strong, Good, Moderate, Weak, or Not a Fit). | Standardizes candidate evaluations across different recruiters. |
| **Branded PDF Compiler** | Generates beautifully designed PDFs from code containing cards, tables, and scoring bars. | Provides clean, presentable reports that can be directly shared with hiring leads. |
| **ZIP Package Export** | Combines the original resume, JD, and generated PDF report into one downloaded ZIP folder. | Organizes candidate records and streamlines file handling for HR departments. |

---

## 🛠️ 4. Tech Stack & Architecture

### Backend Stack
*   **Python 3.11** & **FastAPI**:
    *   *Why?* FastAPI provides high-performance asynchronous endpoints, excellent performance under concurrent loads, and native, automatic Swagger/OpenAPI documentation.
*   **Google GenAI SDK (`google-genai`) & Gemini 2.0 / 1.5 Flash**:
    *   *Why?* Native support for **Structured Outputs** ensures the LLM returns data strictly adhering to Pydantic schemas, eliminating parsing errors and JSON truncation.
*   **Pydantic v2**:
    *   *Why?* Provides rigorous data validation and type enforcement for API request/response payloads, ensuring data integrity before and after AI invocations.
*   **ReportLab**:
    *   *Why?* Enables programmatic creation of complex, high-resolution multi-page PDF documents, allowing exact pixel-perfect control over layout and brand compliance.
*   **PyPDF2 & python-docx**:
    *   *Why?* Light, reliable libraries for extracting raw text from standard resume formats without needing heavy external system dependencies.

### Frontend Stack
*   **React (Vite)**:
    *   *Why?* Vite provides an incredibly fast developer loop (Hot Module Replacement) and optimized production builds. React's state management facilitates a responsive user interface during file uploading and real-time SSE parsing.
*   **Vanilla CSS (Custom Properties)**:
    *   *Why?* Written from scratch to capture a bespoke premium aesthetic (glassmorphism, tailored shadows, smooth CSS animations, customized loading states) tailored to E2M Solutions' design principles, maintaining a lightweight bundle.

### Infrastructure & Deployment
*   **Railway**:
    *   *Why?* Railway allows setting up monorepo applications as multi-service structures (independent React container and FastAPI container) pulling from the same GitHub branch. Features automated container building, easy environment variable provisioning, and reliable runtime hosting.

---

## 📁 5. Directory Structure
```text
├── backend/                   # FastAPI Python Service
│   ├── models/                # Pydantic Schemas (Input/Output data contracts)
│   ├── routers/               # Endpoints (Analysis SSE streams, ZIP exports)
│   ├── services/              # Core utility files (Gemini LLM calls, report compilation, file parsers)
│   ├── Dockerfile             # Container configuration for backend
│   ├── main.py                # Server initialization
│   ├── requirements.txt       # Python dependency declarations
│   └── railway.toml           # Backend deploy scripts
│
├── frontend/                  # React Frontend Service
│   ├── public/                # Standard static assets and SVGs
│   ├── src/
│   │   ├── components/        # Layout elements (Navbar, Footer, Gauge, Dropzone)
│   │   ├── pages/             # Interface Pages (Homepage, AnalyzePage)
│   │   ├── services/          # Connection/API routing calls
│   │   ├── styles/            # Customized theme colors and layout styles
│   │   └── App.jsx            # Routing and React entry file
│   ├── Dockerfile             # Multi-stage production web container
│   ├── nginx.conf             # Nginx reverse proxy configurations
│   └── railway.toml           # Frontend deploy scripts
```

---

## 🎥 6. Video Walkthrough

The project includes an interactive walkthrough video demonstrating the entire workflow:
1. **File Upload & Job Input**: Dropping a candidate's resume (PDF/Word format) and inputting the Job Description.
2. **Real-time SSE Timeline**: Watching the system trace through document parsing, skill extraction, profile comparison, matching score calculation, and PDF report creation.
3. **Interactive Results Interface**: Interacting with the dynamic gauge, reading candidate match stats, analyzing exact/semantic skill matches, reviewing missing skills categorized by priority, and examining the AI's descriptive summary.
4. **Downloading the ZIP Archive**: Clicking the "Download Report" button to retrieve the zipped bundle with the resume, JD, and branded PDF.

> [!NOTE]
> The demonstration video is stored at [assets/demo.mp4](file:///c:/Users/Mohit/Desktop/E2M-Match/assets/demo.mp4). You can watch it directly in your local environment or host it on platforms like Vimeo or YouTube to link it.

---

## 🚀 7. How to Run Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```
Update `.env` with your `GEMINI_API_KEY` and start the server:
```bash
python main.py
```
*(Runs at http://localhost:8000. Swagger docs: http://localhost:8000/api/docs)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(Runs at http://localhost:5173)*
