import { useEffect, useState } from 'react'
import './ScoreGauge.css'

function ScoreGauge({ score, verdict }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [mounted, setMounted] = useState(false)

  // SVG circle math
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  // Color based on score
  const getColor = () => {
    if (score >= 85) return 'var(--color-strong-fit)'
    if (score >= 70) return 'var(--color-good-fit)'
    if (score >= 50) return 'var(--color-moderate-fit)'
    if (score >= 30) return 'var(--color-weak-fit)'
    return 'var(--color-not-fit)'
  }

  useEffect(() => {
    setMounted(true)
    // Animate the score count-up
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  return (
    <div className={`score-gauge ${mounted ? 'score-gauge--mounted' : ''}`} id="score-gauge">
      <div className="score-gauge__circle-wrapper">
        <svg className="score-gauge__svg" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            className="score-gauge__bg"
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            className="score-gauge__progress"
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              stroke: getColor(),
              transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease',
            }}
          />
        </svg>
        <div className="score-gauge__content">
          <span className="score-gauge__number" style={{ color: getColor() }}>
            {animatedScore}
          </span>
          <span className="score-gauge__total">/100</span>
        </div>
      </div>
      <div className="score-gauge__verdict" style={{ color: getColor() }}>
        {verdict}
      </div>
    </div>
  )
}

export default ScoreGauge
