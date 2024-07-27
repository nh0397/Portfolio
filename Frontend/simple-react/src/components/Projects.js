import React, { useContext, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './Projects.css';
import { ThemeContext } from './ThemeContext';
import { useInView } from 'react-intersection-observer';
import EduBridgeImage from '../assets/Screenshots/EduBridge.png';
import FlareGraphImage from '../assets/Screenshots/FlareGraph.png';
import LegalGPTImage from '../assets/Screenshots/LegalGPT.png';

const Projects = ({ data }) => {
  const { darkMode } = useContext(ThemeContext);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const projectCategories = {
    "Full-Stack Development": data.projects.filter(
      (project) =>
        ["LegalGPT", "EduBridge", "FlareGraph"].includes(
          project.title
        )
    ),
    "Learning Projects and Contributions": data.projects.filter((project) =>
      ["Discussion forum", "Flight Fare Prediction", "Naive Bayesian Classifier"].includes(
        project.title
      )
    ),
  };

  const projectImages = {
    "EduBridge": EduBridgeImage,
    "FlareGraph": FlareGraphImage,
    "LegalGPT": LegalGPTImage,
  };

  return (
    <section id="projects" className={`projects-section ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <h2 className="title">Projects</h2>
      <div className="projects-container">
        <div className="first-row">
          {projectCategories["Full-Stack Development"].map((project, index) => (
            <motion.div
              className="project-card"
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={controls}
              variants={{
                visible: { opacity: 1, x: 0, transition: { delay: index * 0.2, duration: 0.5 } },
              }}
              ref={ref}
            >
              <h4>{project.title}</h4>
              <img src={projectImages[project.title] || "https://via.placeholder.com/200"} alt={`Naisarg Halvadiya - ${project.title}`} className="project-image" />
              <p>{project.description}</p>
              <div className="project-tech">
                {project.technologies.map((tech, idx) => (
                  <span key={idx}>{tech}</span>
                ))}
              </div>
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="github-logo" />
              </a>
            </motion.div>
          ))}
        </div>
        <div className="second-row">
          <h4 className="contributions-title">Learning Projects and Contributions</h4>
          <table className="contributions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Technologies</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {projectCategories["Learning Projects and Contributions"].map((project, index) => (
                <tr key={index}>
                  <td>{project.title}</td>
                  <td>
                    {project.technologies.map((tech, idx) => (
                      <span key={idx} className="tech-badge">{tech}</span>
                    ))}
                  </td>
                  <td>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="github-logo" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Projects;
