import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
      <div className="navbar__container container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="nav-logo">
          <svg className="navbar__logo-svg" xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 61 62" fill="none">
            <path d="M0 0V31.0022H30.5024V62H61V0H0ZM22.3418 25.2706H8.15819V5.73092H22.2002V10.3367H13.7925V13.0416H21.1671V17.6313H13.7925V20.6803H22.3418V25.27V25.2706ZM45.7296 5.5802C50.1177 5.5802 53.1201 8.18455 53.1201 12.0852C53.1201 15.4357 50.0482 17.7249 47.3149 19.6948C46.8902 19.9981 46.0554 20.6878 46.0127 20.7467H53.2324V25.4213H38.9346V23.3783C38.9346 20.0688 40.7897 18.9319 44.5555 15.997C46.5229 14.4588 47.3876 13.5799 47.3876 12.2284C47.3876 11.0916 46.6217 10.3293 45.3775 10.3293C44.0459 10.3293 42.9567 11.4662 42.4178 12.7873L38.2701 10.9043C38.9932 8.48722 41.4836 5.57958 45.7302 5.57958L45.7296 5.5802ZM56.6594 56.2709H51.0813V46.5457L47.4297 55.1645H44.0746L40.4212 46.5457V56.2709H34.8455V36.7312H40.747L45.7436 47.9698L50.756 36.7312H56.6594V56.2709Z" fill="currentColor"/>
          </svg>
          <span className="navbar__logo-text">E2M <span className="highlight">MATCH</span></span>
        </Link>

        {/* Nav Links */}
        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          <Link
            to="/"
            className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
            id="nav-home"
          >
            Home
          </Link>
          <a href="/#features" className="navbar__link" id="nav-features">Features</a>
          <a href="/#how-it-works" className="navbar__link" id="nav-how-it-works">How It Works</a>
          <Link
            to="/analyze"
            className={`navbar__link ${location.pathname === '/analyze' ? 'navbar__link--active' : ''}`}
            id="nav-analyze"
          >
            Analyze
          </Link>
        </div>

        {/* CTA Button */}
        <Link to="/analyze" className="btn btn-primary navbar__cta" id="nav-cta">
          Start Matching
        </Link>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
