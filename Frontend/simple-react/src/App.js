import React, { useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import { ThemeProvider, ThemeContext } from './components/ThemeContext';
import './App.css';

const App = ({ portfolioData }) => {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach(section => {
        if (scrollPosition >= section.offsetTop && scrollPosition <= section.offsetTop + section.offsetHeight) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (event) => {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  };

  const sectionBackgroundColor = darkMode ? '#000' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';

  return (
    <div className="App">
      <Header onNavClick={handleNavClick} />
      <div className="content">
        {['section1', 'section2', 'section3', 'section4'].map((sectionId) => (
          <motion.section
            key={sectionId}
            id={sectionId}
            className="section"
            style={{ backgroundColor: sectionBackgroundColor, color: textColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {`Section ${sectionId.charAt(sectionId.length - 1)}`}
          </motion.section>
        ))}
      </div>
    </div>
  );
};

const AppWrapper = (props) => (
  <ThemeProvider>
    <App {...props} />
  </ThemeProvider>
);

export default AppWrapper;
