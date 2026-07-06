import './SkillTag.css'

function SkillTag({ name, type = 'matched', matchType, importance, confidence }) {
  const getIcon = () => {
    if (type === 'matched') return '✓'
    return '✗'
  }

  const getSubLabel = () => {
    if (type === 'matched' && matchType) {
      return matchType === 'semantic' ? 'Semantic' : 'Exact'
    }
    if (type === 'missing' && importance) {
      return importance === 'must-have' ? 'Must-Have' : 'Nice-to-Have'
    }
    return null
  }

  const subLabel = getSubLabel()

  return (
    <div className={`skill-tag skill-tag--${type} ${importance === 'must-have' ? 'skill-tag--critical' : ''}`}>
      <span className="skill-tag__icon">{getIcon()}</span>
      <span className="skill-tag__name">{name}</span>
      {subLabel && (
        <span className={`skill-tag__badge skill-tag__badge--${type}`}>
          {subLabel}
        </span>
      )}
    </div>
  )
}

export default SkillTag
