import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Home from './components/Home';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import About from './components/About';
import { ThemeProvider, ThemeContext } from './components/ThemeContext';
import './App.css';
import data from './data/data.json';

const App = () => {
  const { darkMode } = useContext(ThemeContext);

  const sectionBackgroundColor = darkMode ? '#000' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';

  return (
    <div className="App">
      <Header />
      <div className="content">
        <motion.section
          id="home"
          className="section"
          style={{ backgroundColor: sectionBackgroundColor, color: textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Home data={data} />
        </motion.section>
        {/* <motion.section
          id="about"
          className="section"
          style={{ backgroundColor: sectionBackgroundColor, color: textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <About data={data} />
        </motion.section>
        <motion.section
          id="experience"
          className="section"
          style={{ backgroundColor: sectionBackgroundColor, color: textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Experience data={data} />
        </motion.section>
        <motion.section
          id="projects"
          className="section"
          style={{ backgroundColor: sectionBackgroundColor, color: textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Projects data={data} />
        </motion.section> */}
        <motion.section
          id="contact"
          className="section"
          style={{ backgroundColor: sectionBackgroundColor, color: textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Contact data={data} />
        </motion.section>
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
