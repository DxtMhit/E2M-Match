import { useState, useRef } from 'react'
import FileUpload from '../components/FileUpload'
import Timeline from '../components/Timeline'
import ScoreGauge from '../components/ScoreGauge'
import SkillTag from '../components/SkillTag'
import { startAnalysis, parseSSEStream, downloadReport } from '../services/api'
import './AnalyzePage.css'

// Page states
const STATE = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULTS: 'results',
  ERROR: 'error',
}

function AnalyzePage() {
  const [pageState, setPageState] = useState(STATE.UPLOAD)
  const [resumeFile, setResumeFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [jdMode, setJdMode] = useState('text') // 'text' or 'file'
  const [steps, setSteps] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  // Store files for download
  const resumeFileRef = useRef(null)
  const jdFileRef = useRef(null)

  const canAnalyze = resumeFile && (jdMode === 'text' ? jdText.trim() : jdFile)

  const handleAnalyze = async () => {
    if (!canAnalyze) return

    // Store files for later download
    resumeFileRef.current = resumeFile
    jdFileRef.current = jdFile

    setPageState(STATE.PROCESSING)
    setSteps({})
    setError('')

    try {
      const response = await startAnalysis(
        resumeFile,
        jdMode === 'file' ? jdFile : null,
        jdMode === 'text' ? jdText : null,
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${response.status}`)
      }

      for await (const event of parseSSEStream(response)) {
        if (event.event === 'progress') {
          setSteps((prev) => ({
            ...prev,
            [event.data.step]: {
              status: event.data.status,
              message: event.data.message,
            },
          }))
        } else if (event.event === 'result') {
          setResult(event.data.result)
          setPageState(STATE.RESULTS)
        } else if (event.event === 'error') {
          setError(event.data.message)
          setPageState(STATE.ERROR)
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      setPageState(STATE.ERROR)
    }
  }

  const handleDownload = async () => {
    if (!result || downloading) return
    setDownloading(true)

    try {
      await downloadReport(
        resumeFileRef.current,
        jdMode === 'file' ? jdFileRef.current : null,
        jdMode === 'text' ? jdText : null,
        result,
      )
    } catch (err) {
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleReset = () => {
    setPageState(STATE.UPLOAD)
    setResumeFile(null)
    setJdFile(null)
    setJdText('')
    setSteps({})
    setResult(null)
    setError('')
  }

  return (
    <div className="analyze" id="analyze-page">
      <div className="analyze__container container">
        {/* ===== UPLOAD STATE ===== */}
        {pageState === STATE.UPLOAD && (
          <div className="analyze__upload animate-fade-in-up">
            <div className="analyze__header">
              <span className="analyze__badge">AI Matching Tool</span>
              <h1 className="analyze__title">Analyze Resume vs Job Description</h1>
              <p className="analyze__subtitle">
                Upload a resume and provide a job description to get an instant AI-powered match analysis.
              </p>
            </div>

            <div className="analyze__panels">
              {/* Resume Panel */}
              <div className="analyze__panel" id="resume-panel">
                <div className="analyze__panel-header">
                  <span className="analyze__panel-icon">📄</span>
                  <h2 className="analyze__panel-title">Resume</h2>
                </div>
                <FileUpload
                  label="Upload Resume"
                  description="The candidate's resume to analyze"
                  onFileSelect={setResumeFile}
                  id="resume-upload"
                />
              </div>

              {/* JD Panel */}
              <div className="analyze__panel" id="jd-panel">
                <div className="analyze__panel-header">
                  <span className="analyze__panel-icon">📋</span>
                  <h2 className="analyze__panel-title">Job Description</h2>
                </div>

                {/* Mode toggle */}
                <div className="analyze__jd-toggle">
                  <button
                    className={`analyze__jd-toggle-btn ${jdMode === 'text' ? 'analyze__jd-toggle-btn--active' : ''}`}
                    onClick={() => setJdMode('text')}
                    id="jd-mode-text"
                  >
                    Paste Text
                  </button>
                  <button
                    className={`analyze__jd-toggle-btn ${jdMode === 'file' ? 'analyze__jd-toggle-btn--active' : ''}`}
                    onClick={() => setJdMode('file')}
                    id="jd-mode-file"
                  >
                    Upload File
                  </button>
                </div>

                {jdMode === 'text' ? (
                  <div className="analyze__jd-text-wrapper">
                    <textarea
                      className="analyze__jd-textarea"
                      placeholder="Paste the job description here..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      rows={12}
                      id="jd-textarea"
                    />
                    {jdText && (
                      <span className="analyze__jd-count">{jdText.length} characters</span>
                    )}
                  </div>
                ) : (
                  <FileUpload
                    label="Upload Job Description"
                    description="The job description to match against"
                    onFileSelect={setJdFile}
                    id="jd-upload"
                  />
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <div className="analyze__action">
              <button
                className={`btn btn-primary btn-lg analyze__btn ${!canAnalyze ? 'analyze__btn--disabled' : ''}`}
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                id="analyze-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Analyze Match
              </button>
            </div>
          </div>
        )}

        {/* ===== PROCESSING STATE ===== */}
        {pageState === STATE.PROCESSING && (
          <div className="analyze__processing animate-fade-in">
            <div className="analyze__processing-header">
              <h2 className="analyze__processing-title">Analyzing Your Match</h2>
              <p className="analyze__processing-subtitle">
                Our AI is working through the analysis. This usually takes 15–30 seconds.
              </p>
            </div>
            <Timeline steps={steps} />
          </div>
        )}

        {/* ===== ERROR STATE ===== */}
        {pageState === STATE.ERROR && (
          <div className="analyze__error animate-fade-in">
            <div className="analyze__error-icon">⚠️</div>
            <h2 className="analyze__error-title">Analysis Failed</h2>
            <p className="analyze__error-message">{error}</p>
            <button className="btn btn-primary btn-lg" onClick={handleReset} id="error-retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* ===== RESULTS STATE ===== */}
        {pageState === STATE.RESULTS && result && (
          <div className="analyze__results animate-fade-in">
            {/* Results Header */}
            <div className="results__header">
              <h2 className="results__title">Match Analysis Report</h2>
              {result.candidate_name && (
                <p className="results__candidate">
                  Candidate: <strong>{result.candidate_name}</strong>
                  {result.job_title && <> &nbsp;·&nbsp; Position: <strong>{result.job_title}</strong></>}
                </p>
              )}
            </div>

            {/* Score + Stats Row */}
            <div className="results__score-section">
              <ScoreGauge score={result.score} verdict={result.verdict} />

              <div className="results__stats">
                <div className="results__stat">
                  <span className="results__stat-number results__stat-number--blue">{result.matched_skills?.length || 0}</span>
                  <span className="results__stat-label">Skills Matched</span>
                </div>
                <div className="results__stat">
                  <span className="results__stat-number results__stat-number--red">{result.missing_skills?.length || 0}</span>
                  <span className="results__stat-label">Skills Missing</span>
                </div>
                <div className="results__stat">
                  <span className="results__stat-number results__stat-number--orange">{result.resume_skills_count || 0}</span>
                  <span className="results__stat-label">Resume Skills</span>
                </div>
                <div className="results__stat">
                  <span className="results__stat-number results__stat-number--orange">{result.jd_skills_count || 0}</span>
                  <span className="results__stat-label">JD Requirements</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="results__section" id="results-explanation">
              <h3 className="results__section-title">
                <span className="results__section-icon">📝</span>
                Analysis Summary
              </h3>
              <p className="results__explanation">{result.explanation}</p>
            </div>

            {/* Skills Breakdown */}
            <div className="results__skills-grid">
              {/* Matched Skills */}
              <div className="results__section results__section--matched" id="results-matched-skills">
                <h3 className="results__section-title">
                  <span className="results__section-icon">✅</span>
                  Matched Skills ({result.matched_skills?.length || 0})
                </h3>
                <div className="results__skills-list">
                  {result.matched_skills?.map((skill, i) => (
                    <SkillTag
                      key={i}
                      name={skill.name}
                      type="matched"
                      matchType={skill.match_type}
                      confidence={skill.confidence}
                    />
                  ))}
                  {(!result.matched_skills || result.matched_skills.length === 0) && (
                    <p className="results__empty">No skills matched.</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="results__section results__section--missing" id="results-missing-skills">
                <h3 className="results__section-title">
                  <span className="results__section-icon">❌</span>
                  Missing Skills ({result.missing_skills?.length || 0})
                </h3>
                <div className="results__skills-list">
                  {result.missing_skills?.map((skill, i) => (
                    <SkillTag
                      key={i}
                      name={skill.name}
                      type="missing"
                      importance={skill.importance}
                    />
                  ))}
                  {(!result.missing_skills || result.missing_skills.length === 0) && (
                    <p className="results__empty">No critical skills missing!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="results__section" id="results-suggestions">
                <h3 className="results__section-title">
                  <span className="results__section-icon">💡</span>
                  Improvement Suggestions
                </h3>
                <ul className="results__suggestions">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="results__suggestion">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="results__actions">
              <button
                className={`btn btn-primary btn-lg ${downloading ? 'btn--loading' : ''}`}
                onClick={handleDownload}
                disabled={downloading}
                id="download-report-btn"
              >
                {downloading ? (
                  <>
                    <div className="btn__spinner" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Full Report
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={handleReset}
                id="analyze-another-btn"
              >
                Analyze Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyzePage
