import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" id="footer">
      <div className="footer__container container">
        {/* Top section */}
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo" id="footer-logo">
              <svg className="footer__logo-svg" xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 61 62" fill="none">
                <path d="M0 0V31.0022H30.5024V62H61V0H0ZM22.3418 25.2706H8.15819V5.73092H22.2002V10.3367H13.7925V13.0416H21.1671V17.6313H13.7925V20.6803H22.3418V25.27V25.2706ZM45.7296 5.5802C50.1177 5.5802 53.1201 8.18455 53.1201 12.0852C53.1201 15.4357 50.0482 17.7249 47.3149 19.6948C46.8902 19.9981 46.0554 20.6878 46.0127 20.7467H53.2324V25.4213H38.9346V23.3783C38.9346 20.0688 40.7897 18.9319 44.5555 15.997C46.5229 14.4588 47.3876 13.5799 47.3876 12.2284C47.3876 11.0916 46.6217 10.3293 45.3775 10.3293C44.0459 10.3293 42.9567 11.4662 42.4178 12.7873L38.2701 10.9043C38.9932 8.48722 41.4836 5.57958 45.7302 5.57958L45.7296 5.5802ZM56.6594 56.2709H51.0813V46.5457L47.4297 55.1645H44.0746L40.4212 46.5457V56.2709H34.8455V36.7312H40.747L45.7436 47.9698L50.756 36.7312H56.6594V56.2709Z" fill="currentColor"/>
              </svg>
              <span className="footer__logo-text">E2M <span className="highlight">MATCH</span></span>
            </Link>
            <div className="footer__brand-text">
              <p className="footer__tagline">AI-Powered Recruitment Tool</p>
              <p className="footer__description">
                Intelligent resume screening and candidate matching, powered by E2M Solutions.
              </p>
            </div>
          </div>

          <div className="footer__links-group">
            <div className="footer__links-col">
              <h4 className="footer__links-title">Product</h4>
              <Link to="/" className="footer__link">Home</Link>
              <a href="/#features" className="footer__link">Features</a>
              <a href="/#how-it-works" className="footer__link">How It Works</a>
              <Link to="/analyze" className="footer__link">Start Matching</Link>
            </div>
            <div className="footer__links-col">
              <h4 className="footer__links-title">Company</h4>
              <a href="https://www.e2msolutions.com/" target="_blank" rel="noopener noreferrer" className="footer__link">E2M Solutions</a>
              <a href="https://www.e2msolutions.com/about-us/" target="_blank" rel="noopener noreferrer" className="footer__link">About E2M</a>
              <a href="https://www.e2msolutions.com/ai-services/" target="_blank" rel="noopener noreferrer" className="footer__link">AI Services</a>
            </div>
          </div>

          <div className="footer__social">
            <span className="footer__social-label">Follow Us</span>
            <div className="footer__social-icons">
              <a href="https://www.youtube.com/@e2msolutions" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer__social-icon" id="footer-youtube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/e2msolutions" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer__social-icon" id="footer-instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/e2msolutions" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer__social-icon" id="footer-linkedin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider"></div>

        {/* Bottom */}
        <div className="footer__bottom">
          <div className="footer__bottom-brand">
            <svg className="footer__bottom-logo-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 61 62" fill="none">
              <path d="M0 0V31.0022H30.5024V62H61V0H0ZM22.3418 25.2706H8.15819V5.73092H22.2002V10.3367H13.7925V13.0416H21.1671V17.6313H13.7925V20.6803H22.3418V25.27V25.2706ZM45.7296 5.5802C50.1177 5.5802 53.1201 8.18455 53.1201 12.0852C53.1201 15.4357 50.0482 17.7249 47.3149 19.6948C46.8902 19.9981 46.0554 20.6878 46.0127 20.7467H53.2324V25.4213H38.9346V23.3783C38.9346 20.0688 40.7897 18.9319 44.5555 15.997C46.5229 14.4588 47.3876 13.5799 47.3876 12.2284C47.3876 11.0916 46.6217 10.3293 45.3775 10.3293C44.0459 10.3293 42.9567 11.4662 42.4178 12.7873L38.2701 10.9043C38.9932 8.48722 41.4836 5.57958 45.7302 5.57958L45.7296 5.5802ZM56.6594 56.2709H51.0813V46.5457L47.4297 55.1645H44.0746L40.4212 46.5457V56.2709H34.8455V36.7312H40.747L45.7436 47.9698L50.756 36.7312H56.6594V56.2709Z" fill="currentColor"/>
            </svg>
            <span className="footer__bottom-text">White Label Partner for Web, Marketing & AI.</span>
          </div>
          <p className="footer__copyright">
            Copyright © {currentYear} E2M. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
