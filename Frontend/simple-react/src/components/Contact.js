import React from 'react';

const Contact = ({ data }) => {
  return (
    <section id="contact">
      <h2>Contact</h2>
      <p>Email: <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a></p>
      <p>LinkedIn: <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer">{data.contact.linkedin}</a></p>
      <p>GitHub: <a href={data.contact.github} target="_blank" rel="noopener noreferrer">{data.contact.github}</a></p>
    </section>
  );
};

export default Contact;
