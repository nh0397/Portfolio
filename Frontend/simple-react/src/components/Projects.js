import React from 'react';

const Projects = ({ data }) => {
  return (
    <section id="projects">
      <h2>Projects</h2>
      {data.projects.map((project, index) => (
        <div key={index}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
        </div>
      ))}
    </section>
  );
};

export default Projects;
