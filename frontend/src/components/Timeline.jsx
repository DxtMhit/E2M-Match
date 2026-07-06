import './Timeline.css'

const STEP_CONFIG = {
  parsing: {
    icon: '📄',
    label: 'Parsing Documents',
    defaultMessage: 'Extracting text from your files...',
  },
  extracting: {
    icon: '🔍',
    label: 'Extracting Skills',
    defaultMessage: 'AI is identifying skills and qualifications...',
  },
  comparing: {
    icon: '⚖️',
    label: 'Comparing Profiles',
    defaultMessage: 'Matching resume skills against JD requirements...',
  },
  scoring: {
    icon: '📊',
    label: 'Computing Score',
    defaultMessage: 'Calculating match score and verdict...',
  },
  generating_report: {
    icon: '📋',
    label: 'Generating Report',
    defaultMessage: 'Preparing your detailed analysis report...',
  },
}

const STEP_ORDER = ['parsing', 'extracting', 'comparing', 'scoring', 'generating_report']

function Timeline({ steps }) {
  return (
    <div className="timeline" id="analysis-timeline">
      {STEP_ORDER.map((stepKey, index) => {
        const config = STEP_CONFIG[stepKey]
        const stepData = steps[stepKey]
        const status = stepData?.status || 'pending'
        const message = stepData?.message || config.defaultMessage

        return (
          <div
            key={stepKey}
            className={`timeline__item timeline__item--${status}`}
            id={`timeline-step-${stepKey}`}
          >
            {/* Connector line */}
            {index < STEP_ORDER.length - 1 && (
              <div className={`timeline__connector timeline__connector--${status}`} />
            )}

            {/* Status icon */}
            <div className={`timeline__icon timeline__icon--${status}`}>
              {status === 'completed' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : status === 'in_progress' ? (
                <div className="timeline__spinner" />
              ) : status === 'error' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <span className="timeline__step-number">{index + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className="timeline__content">
              <div className="timeline__header">
                <span className="timeline__emoji">{config.icon}</span>
                <h3 className="timeline__label">{config.label}</h3>
              </div>
              <p className="timeline__message">{message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
