import React from 'react';
import { motion } from 'framer-motion';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faChalkboardTeacher, faCode, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import resume from '../assets/Naisarg Halvadiya.pdf';  // Adjust the path to your resume file
import './Experience.css';

const ExperienceCard = ({ experience, icon }) => (
  <VerticalTimelineElement
    contentStyle={{ background: '#f9f9f9', color: '#333' }}
    contentArrowStyle={{ borderRight: '7px solid  #f9f9f9' }}
    date={experience.period}
    dateClassName="timeline-date"
    iconStyle={{ background: '#4A4A4A', color: '#fff' }}  // Updated color
    icon={<FontAwesomeIcon icon={icon} />}
  >
    <h3 className="vertical-timeline-element-title">{experience.role}</h3>
    <h4 className="vertical-timeline-element-subtitle">{experience.company}</h4>
    <p>{experience.achievements.join(' ')}</p>
  </VerticalTimelineElement>
);

const Experience = ({ data }) => {
  const experienceIcons = {
    "San Francisco State University": faChalkboardTeacher,
    "CODEPATH": faCode,
    "MU SIGMA INC.": faBriefcase
  };

  return (
    <motion.section
      id="experience"
      className="experience-section"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, delay: 0.75 }}
    >
      <h2>Experience</h2>
      <VerticalTimeline>
        {data.experience.map((exp, index) => (
          <ExperienceCard key={index} experience={exp} icon={experienceIcons[exp.company]} />
        ))}
        <VerticalTimelineElement
          contentStyle={{ background: '#f9f9f9', color: '#333', textAlign: 'center' }}
          contentArrowStyle={{ borderRight: '7px solid  #f9f9f9' }}
          iconStyle={{ background: '#4A4A4A', color: '#fff' }}  // Updated color
          icon={<FontAwesomeIcon icon={faDownload} />}
        >
          <h3 className="vertical-timeline-element-title">My Resume</h3>
          <a href={resume} download className="button">
            <button className="resume-button">
              <FontAwesomeIcon icon={faDownload} /> Download Resume
            </button>
          </a>
        </VerticalTimelineElement>
      </VerticalTimeline>
    </motion.section>
  );
};

export default Experience;
