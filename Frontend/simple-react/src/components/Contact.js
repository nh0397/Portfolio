import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Contact.css';

const Contact = ({ data }) => {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const controls = useAnimation();
  const contactRef = useRef();

  useEffect(() => {
    setIsFormValid(
      form.name.trim() !== '' &&
      form.email.trim() !== '' &&
      form.message.trim() !== ''
    );
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        'serviceID', // paste your ServiceID here
        'templateID', // paste your TemplateID here
        {
          from_name: form.name,
          to_name: 'YourName', // put your name here
          from_email: form.email,
          to_email: 'youremail@gmail.com', // put your email here
          message: form.message,
        },
        'yourpublickey' // paste your Public Key here
      )
      .then(
        () => {
          setForm({
            name: '',
            email: '',
            message: '',
          });
          setLoading(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        },
        (error) => {
          setLoading(false);
          setForm({
            name: '',
            email: '',
            message: '',
          });
          console.log(error);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      );
  };

  const closeToast = () => {
    setShowToast(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            controls.start({ opacity: 1, x: 0 });
            observer.disconnect(); // disconnect after animation starts
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(contactRef.current);
  }, [controls]);

  return (
    <motion.section
      id="contact"
      className="contact-section"
      ref={contactRef}
      initial={{ opacity: 0, x: -100 }}
      animate={controls}
      transition={{ duration: 0.75, delay: 0.75 }}
    >
      {showToast && (
        <div className={`toast ${data.mode}`}>
          <span>Message sent successfully! ✨</span>
          <button onClick={closeToast} className="toast-close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      <h2 className="contact-title">Ready to create something awesome?</h2>
      <h2>Get in touch, and let's make magic together! 🌟</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="contact-table">
        <div className="contact-row">
          <div className="label-cell">
            <label htmlFor="name">Name:</label>
          </div>
          <div className="input-cell">
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="contact-row">
          <div className="label-cell">
            <label htmlFor="email">Email:</label>
          </div>
          <div className="input-cell">
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="contact-row">
          <div className="label-cell">
            <label htmlFor="message">Message:</label>
          </div>
          <div className="input-cell">
            <textarea
              className="text-message"
              id="message"
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
        </div>
        <div className="submit-row">
          <div className="contact-column-full">
            <button type="submit" disabled={!isFormValid} className={!isFormValid ? 'disabled' : ''}>
              <FontAwesomeIcon icon={faEnvelope} /> {loading ? 'Sending' : 'Send'}
            </button>
          </div>
        </div>
      </form>
      <div className="contact-icons">
        <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedin} className="contact-icon" />
        </a>
        <a href={data.contact.github} target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGithub} className="contact-icon" />
        </a>
      </div>
      <footer className="footer">
        <p>&copy; 2024. Code and idea credits to <a href="https://github.com/shaqdeff/Portfolio-Template" target="_blank" rel="noopener noreferrer">Shaquile's GitHub repo</a>.</p>
      </footer>
    </motion.section>
  );
};

export default Contact;
