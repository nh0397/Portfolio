import React from 'react';

const Experience = ({ data }) => {
  return (
    <section id="experience">
      <h2>Experience</h2>
      {data.experience.map((job, index) => (
        <div key={index}>
          <h3>{job.role} at {job.company}</h3>
          <p>{job.period}</p>
          <ul>
            {job.achievements.map((achievement, idx) => (
              <li key={idx}>{achievement}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export default Experience;
