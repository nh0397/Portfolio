import React from 'react';

const Skills = ({ data }) => {
  return (
    <section id="skills" className="section-skills">
      <h2>Skills</h2>
      <ul>
        {data.skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </section>
  );
};

export default Skills;
