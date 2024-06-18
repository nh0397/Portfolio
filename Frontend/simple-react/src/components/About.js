import React from 'react';

const About = ({ data }) => {
  return (
    <section id="about" className="section-about">
      <h2>About Me</h2>
      <p>{data.bio}</p>
    </section>
  );
};

export default About;
