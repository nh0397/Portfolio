import React from 'react';
import './Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Contact = ({ data }) => {
  return (
    <section id="contact" className="contact-section">
      <h2 className="contact-title">Ready to create something awesome?</h2>
      <h2>Get in touch, and let's make magic together! 🌟</h2>
      <div className="contact-table">
        <div className="contact-row">
          <div className="label-cell">
            <label htmlFor="name">Name:</label>
          </div>
          <div className="input-cell">
            <input type="text" id="name" name="name" required />
          </div>
        </div>
        <div className="contact-row">
          <div className="label-cell">
            <label htmlFor="email">Email:</label>
          </div>
          <div className="input-cell">
            <input type="email" id="email" name="email" required />
          </div>
        </div>
        <div className="contact-row">
          <div className="label-cell">
            <label htmlFor="message">Message:</label>
          </div>
          <div className="input-cell">
            <textarea className='text-message' id="message" name="message" rows="4" required></textarea>
          </div>
        </div>
        <div className="submit-row">
          <div className="contact-column-full">
            <button type="submit">
              <FontAwesomeIcon icon={faEnvelope} /> Send
            </button>
          </div>
        </div>
      </div>
      <div className="contact-icons">
        <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedin} className="contact-icon" />
        </a>
        <a href={data.contact.github} target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGithub} className="contact-icon" />
        </a>
      </div>
    </section>
  );
};

export default Contact;
