import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HomePage.css'

/* Animated counter hook */
function useCountUp(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setStarted(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started, startOnView])

  useEffect(() => {
    if (!started) return
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target, duration])

  return { count, ref }
}

/* Scroll animation hook */
function useScrollAnimation() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function HomePage() {
  const stats = [
    { value: 10000, suffix: '+', label: 'RESUMES ANALYZED' },
    { value: 85, suffix: '%', label: 'TIME SAVED' },
    { value: 95, suffix: '%', label: 'ACCURACY RATE' },
    { value: 500, suffix: '+', label: 'SKILLS TRACKED' },
  ]

  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Skill Extraction',
      description: 'Powered by Google Gemini, our AI extracts every technical and soft skill from resumes and job descriptions with precision.',
    },
    {
      icon: '🎯',
      title: 'Smart Must-Have Detection',
      description: 'Automatically identifies must-have vs. nice-to-have requirements from JDs — no manual tagging needed.',
    },
    {
      icon: '⚡',
      title: 'Instant Match Scoring',
      description: 'Get a 0–100 match score with a clear verdict in seconds, not hours. Screen candidates at scale.',
    },
    {
      icon: '📊',
      title: 'Downloadable PDF Reports',
      description: 'Generate professional, branded analysis reports with skill breakdowns and improvement suggestions.',
    },
    {
      icon: '📁',
      title: 'Multi-Format Upload',
      description: 'Upload resumes and JDs in PDF, DOCX, DOC, or TXT format. Paste JD text directly — your choice.',
    },
    {
      icon: '🔗',
      title: 'Semantic Skill Matching',
      description: 'Goes beyond keyword matching. "React.js" matches "ReactJS", "Node" matches "Node.js" — intelligently.',
    },
  ]

  const howItWorks = [
    { step: '01', title: 'Upload', description: 'Upload the resume and job description in any supported format.' },
    { step: '02', title: 'AI Analysis', description: 'Our Gemini-powered AI extracts and compares skills in real-time.' },
    { step: '03', title: 'Review Results', description: 'See match score, verdict, matched & missing skills at a glance.' },
    { step: '04', title: 'Download Report', description: 'Download a complete ZIP bundle with report, resume, and JD.' },
  ]

  const featuresAnim = useScrollAnimation()
  const howAnim = useScrollAnimation()
  const ctaAnim = useScrollAnimation()

  return (
    <div className="home" id="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero" id="hero">
        <div className="hero__overlay" />
        <div className="hero__content container">
          <h1 className="hero__title animate-fade-in-up">
            AI-Powered Resume Screening.
            <br />
            <span className="hero__title-bold">Recruiter-Grade Precision.</span>
          </h1>
          <p className="hero__subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            E2M&apos;s intelligent matching tool compares resumes against job descriptions,
            extracts skills using Gemini AI, and delivers instant match scores with
            actionable insights. Screen smarter. Hire faster.
          </p>
          <div className="hero__actions animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/analyze" className="btn btn-primary btn-lg" id="hero-cta-start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Start Matching
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg" id="hero-cta-how">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats" id="stats">
        <div className="stats__container container">
          {stats.map((stat, i) => {
            const { count, ref } = useCountUp(stat.value)
            return (
              <div className="stats__item" key={i} ref={ref}>
                <span className="stats__number">
                  {count.toLocaleString()}{stat.suffix}
                </span>
                <span className="stats__label">{stat.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section
        className={`features ${featuresAnim.visible ? 'features--visible' : ''}`}
        id="features"
        ref={featuresAnim.ref}
      >
        <div className="features__container container">
          <div className="features__header">
            <span className="features__badge">Features</span>
            <h2 className="features__title">
              Everything You Need to
              <br />
              <span className="text-gradient">Screen Smarter.</span>
            </h2>
            <p className="features__subtitle">
              Powered by cutting-edge AI to give recruiters the edge they need.
            </p>
          </div>
          <div className="features__grid">
            {features.map((feature, i) => (
              <div
                className="feature-card"
                key={i}
                style={{ animationDelay: `${i * 0.1}s` }}
                id={`feature-${i}`}
              >
                <span className="feature-card__icon">{feature.icon}</span>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section
        className={`how-it-works ${howAnim.visible ? 'how-it-works--visible' : ''}`}
        id="how-it-works"
        ref={howAnim.ref}
      >
        <div className="how-it-works__container container">
          <div className="how-it-works__header">
            <h2 className="how-it-works__title">How It Works</h2>
            <p className="how-it-works__subtitle">Four simple steps to data-driven hiring decisions.</p>
          </div>
          <div className="how-it-works__steps">
            {howItWorks.map((item, i) => (
              <div className="how-step" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="how-step__number">{item.step}</div>
                <h3 className="how-step__title">{item.title}</h3>
                <p className="how-step__description">{item.description}</p>
                {i < howItWorks.length - 1 && (
                  <div className="how-step__arrow">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        className={`cta-section ${ctaAnim.visible ? 'cta-section--visible' : ''}`}
        id="cta-section"
        ref={ctaAnim.ref}
      >
        <div className="cta-section__container container">
          <h2 className="cta-section__title">
            Ready to Transform Your
            <br />
            Hiring Process?
          </h2>
          <p className="cta-section__subtitle">
            Stop spending hours on manual resume screening. Let AI do the heavy lifting.
          </p>
          <Link to="/analyze" className="btn btn-primary btn-lg cta-section__btn" id="cta-start-matching">
            Start Matching Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
