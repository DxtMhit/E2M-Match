# E2M Resume-JD Matching Tool

An intelligent, AI-powered resume screening and job description matching platform designed with E2M Solutions' signature premium brand aesthetics.

This application uses the **Google Gemini 2.0/1.5 Flash** models via native **Structured JSON Outputs** to extract skills from resumes and job descriptions, compare them semantically, calculate compatibility scores, and generate premium matching reports.

---

## 🎥 Application Demonstration

<p align="center">
  <video src="assets/demo.mp4" width="100%" poster="assets/demo-poster.png" controls autoplay loop muted style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
    Your browser does not support the video tag.
  </video>
</p>

---

## 🌟 Key Features

*   **AI Profile Extraction**: Instantly parses candidate resumes and job descriptions to extract key skills, years of experience, qualifications, and target roles.
*   **Semantic Skills Analysis**: Compares candidate capabilities against job requirements using advanced semantic matching (classifying overlaps as *exact* or *semantic* matches).
*   **Gap Identification**: Automatically isolates missing skills and labels them by importance (*must-have* vs. *nice-to-have*).
*   **Match Scoring & Verdicts**: Calculates a match percentage (0–100%) and assigns a fit category (*Strong Fit*, *Good Fit*, *Moderate Fit*, *Weak Fit*, or *Not a Fit*).
*   **Branded PDF Report Generation**: Dynamically compiles results into a clean corporate PDF using E2M branding colors, complete with stats cards, tables, and lists.
*   **Complete ZIP Bundle Exports**: Downloads a ZIP archive containing the candidate's original resume, the job description, and the generated PDF Match Report.
*   **Multi-format Parsing**: Supports parsing text from `.pdf`, `.docx`, `.doc`, and `.txt` files out of the box.

---

## 🛠️ Architecture & Technology Stack

The project is structured as a monorepo consisting of two primary components:

### Backend (Python/FastAPI)
*   **Framework**: FastAPI (high-performance asynchronous API endpoints)
*   **AI Engine**: Google GenAI SDK (`google-genai`) querying `gemini-2.0-flash` / `gemini-1.5-flash`
*   **Data Validation**: Pydantic v2 (forces schema compliance on both inputs and structured AI responses)
*   **PDF Compiler**: ReportLab (creates A4 PDF documents from code)
*   **File Parsers**: `pypdf`, `python-docx` for document processing

### Frontend (React/Vite)
*   **Framework**: React (built with Vite for fast HMR and compilation)
*   **Styling**: Pure CSS (using custom variables matching E2M's high-contrast theme)
*   **Animations**: CSS transitions and custom SVG loading timelines

---

## 📁 Repository Directory Structure

```text
├── backend/                   # FastAPI Backend
│   ├── models/                # Pydantic Schemas for validation
│   ├── routers/               # HTTP endpoints (analysis, download)
│   ├── services/              # Core logic (file parsing, Gemini, ReportLab)
│   ├── Dockerfile             # Production container settings
│   ├── main.py                # Server entry point
│   ├── requirements.txt       # Python dependencies
│   └── railway.toml           # Backend deployment instructions
│
├── frontend/                  # React Frontend
│   ├── public/                # SVGs and static assets
│   ├── src/
│   │   ├── components/        # Layout elements (Navbar, Footer, Gauge, Dropzone)
│   │   ├── pages/             # App Pages (Homepage, AnalyzePage)
│   │   ├── services/          # API fetch services
│   │   ├── styles/            # Branding theme CSS
│   │   └── App.jsx            # Main Router
│   ├── Dockerfile             # Multi-stage production container
│   ├── nginx.conf             # Production proxy settings
│   └── railway.toml           # Frontend deployment instructions
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- A Google Gemini API Key (obtainable via [Google AI Studio](https://aistudio.google.com/))

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
5. Add your API key and configure parameters:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   MODEL_NAME=gemini-1.5-flash
   FRONTEND_URL=http://localhost:5173
   ```
6. Start the FastAPI development server:
   ```bash
   python main.py
   ```
   *The backend will run at `http://localhost:8000` with Swagger docs available at `http://localhost:8000/api/docs`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## ☁️ Production Deployment on Railway

Since the project contains a monorepo setup, you must deploy the frontend and backend as separate services pointing to the same GitHub repository:

### 1. Deploy Backend
*   **Root Directory**: `backend`
*   **Variables**:
    *   `GEMINI_API_KEY`: `<Your API Key>`
    *   `MODEL_NAME`: `gemini-1.5-flash`
    *   `FRONTEND_URL`: `<Your generated frontend domain>`
*   Generate a public domain in Railway settings and copy the link.

### 2. Deploy Frontend
*   **Root Directory**: `frontend`
*   **Variables**:
    *   `VITE_API_URL`: `<Your generated backend domain>`
*   Generate a public domain in Railway settings to access the live application.
