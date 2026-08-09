import React from 'react';

const Education = ({ data }) => {
  return (
    <section id="education">
      <h2>Education</h2>
      <div>
        <h3>{data.education.degree}</h3>
        <p>{data.education.institution}</p>
        <p>GPA: {data.education.gpa}</p>
        <p>Expected Graduation: {data.education.graduation}</p>
      </div>
    </section>
  );
};

export default Education;
