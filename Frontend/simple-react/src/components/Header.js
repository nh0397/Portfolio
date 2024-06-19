import React, { useContext } from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faProjectDiagram, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import ThemeToggler from './ThemeToggler';
import { ThemeContext } from './ThemeContext';
import Logo from '../assets/Logo.png'; // Add the path to your logo image

const Header = ({ onNavClick }) => {
  const { darkMode } = useContext(ThemeContext);
  const modeClass = darkMode ? 'dark-mode' : 'light-mode';

  return (
    <header className={`header ${modeClass}`}>
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo" />
      </div>
      <nav className="nav-container">
        <ul className="nav-list">
          <li>
            <a href="#section1" className="nav-item" onClick={onNavClick}>
              <FontAwesomeIcon icon={faHome} />
              <span className="nav-text">Home</span>
            </a>
          </li>
          <li>
            <a href="#section2" className="nav-item" onClick={onNavClick}>
              <FontAwesomeIcon icon={faUser} />
              <span className="nav-text">About</span>
            </a>
          </li>
          <li>
            <a href="#section3" className="nav-item" onClick={onNavClick}>
              <FontAwesomeIcon icon={faProjectDiagram} />
              <span className="nav-text">Projects</span>
            </a>
          </li>
          <li>
            <a href="#section4" className="nav-item" onClick={onNavClick}>
              <FontAwesomeIcon icon={faEnvelope} />
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
