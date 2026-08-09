import React, { useContext } from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faProjectDiagram, faEnvelope, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import ThemeToggler from './ThemeToggler';
import { ThemeContext } from './ThemeContext';
import Logo from '../assets/Logo.png'; // Add the path to your logo image

const Header = ({ onNavClick }) => {
  const { darkMode } = useContext(ThemeContext);
  const modeClass = darkMode ? 'dark-mode' : 'light-mode';

  const handleNavClick = (event) => {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`header ${modeClass}`}>
      <div className="logo-container">
        <img src={Logo} alt="Naisarg Halvadiya Logo" className="logo" />
      </div>
      <nav className="nav-container" aria-label="Main navigation">
        <ul className="nav-list">
          <li>
            <a 
              href="#home" 
              className="nav-item" 
              onClick={handleNavClick}
              aria-label="Navigate to Home section"
            >
              <FontAwesomeIcon icon={faHome} aria-hidden="true" />
              <span className="nav-text">Home</span>
            </a>
          </li>
          <li>
            <a 
              href="#about" 
              className="nav-item" 
              onClick={handleNavClick}
              aria-label="Navigate to About section"
            >
              <FontAwesomeIcon icon={faUser} aria-hidden="true" />
              <span className="nav-text">About</span>
            </a>
          </li>
          <li>
            <a 
              href="#experience" 
              className="nav-item" 
              onClick={handleNavClick}
              aria-label="Navigate to Experience section"
            >
              <FontAwesomeIcon icon={faBriefcase} aria-hidden="true" />
              <span className="nav-text">Experience</span>
            </a>
          </li>
          <li>
            <a 
              href="#projects" 
              className="nav-item" 
              onClick={handleNavClick}
              aria-label="Navigate to Projects section"
            >
              <FontAwesomeIcon icon={faProjectDiagram} aria-hidden="true" />
              <span className="nav-text">Projects</span>
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              className="nav-item" 
              onClick={handleNavClick}
              aria-label="Navigate to Contact section"
            >
              <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" />
              <span className="nav-text">Contact</span>
            </a>
          </li>
        </ul>
        <ThemeToggler />
      </nav>
    </header>
  );
};

export default Header;