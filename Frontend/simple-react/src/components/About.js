import React, { Suspense, useContext } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import CubeCanvas from './CubeCanvas';
import Loader from './Loader';
import './About.css';
import data from '../data/data.json';
import { ThemeContext } from './ThemeContext';
import myPhoto from '../assets/My-Photo.jpg'

const About = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <section id="about" className={`about-section ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <img src={myPhoto} alt="Naisarg Halvadiya Photo" className="about-photo" />
      <div className="about-content">
        <div className="about-text">
          <h3>About Me</h3>
          <p className='data-brief'>{data.brief}</p>
        </div>
      </div>
      <h3>Education</h3>
      <VerticalTimeline>
        {data.education.map((edu, index) => (
          <VerticalTimelineElement
            key={index}
            contentStyle={{ background: '#f9f9f9', color: '#333' }}
            contentArrowStyle={{ borderRight: '7px solid  #f9f9f9' }}
            date={`Graduation: ${edu.graduation}`}
            iconStyle={{ background: '#4A4A4A', color: '#fff' }}
            icon={<FontAwesomeIcon icon={edu.degree.includes('M.S.') ? faGraduationCap : faUserGraduate} />}
          >
            <h3 className="vertical-timeline-element-title">{edu.degree}</h3>
            <h4 className="vertical-timeline-element-subtitle">{edu.institution}</h4>
            <p className='GPA'>GPA: {edu.gpa}</p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
      <h3>Technical Skills</h3>
      <div className="skills-container">
        {Object.entries(data.skills).map(([category, skills], index) => (
          <div key={index} className="skill-category">
            <h4>{category}</h4>
            <div className="skills-row">
              <Suspense fallback={<Loader />}>
                <CubeCanvas 
                  icons={skills.map(skill => skill.icon)} 
                  isDarkMode={darkMode}
                />
              </Suspense>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
