import React, { useState } from 'react';
import './Contact.css';
import { portfolioConfig } from '../../../config/portfolioConfig';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all fields');
      return;
    }

    // Simulate form submission
    try {
      // In a real app, you'd send this to a backend
      console.log('Sending:', formData);

      // Show success message
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  const personal = portfolioConfig.personal;

  const contactOptions = [
    {
      icon: '📧',
      title: 'Email',
      value: personal.email,
      link: `mailto:${personal.email}`,
      type: 'email',
      svgIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
    },
    {
      icon: '💼',
      title: 'LinkedIn',
      value: 'Connect on LinkedIn',
      link: personal.linkedin,
      type: 'link',
      svgIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.75 1.75 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
        </svg>
      ),
    },
    {
      icon: '🐙',
      title: 'GitHub',
      value: 'View my repositories',
      link: personal.github,
      type: 'link',
      svgIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.544 2.914 1.186.092-.923.35-1.544.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.31.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
        </svg>
      ),
    },
    {
      icon: '📍',
      title: 'Location',
      value: personal.location,
      type: 'text',
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <h1 className="gradient-text">Get In Touch</h1>
        <p className="hero-subtitle">
          Let's collaborate and create something amazing together
        </p>
      </div>

      <div className="contact-container">
        {/* Contact Info Cards */}
        <section className="contact-info-section">
          <h2 className="section-title">Reach Out</h2>
          <div className="contact-cards">
            {contactOptions.map((option, idx) => (
              <div key={idx} className="contact-card">
                <div className="card-icon">
                  {option.svgIcon || option.icon}
                </div>
                <h3>{option.title}</h3>
                {option.type === 'email' ? (
                  <a href={option.link} className="contact-link">
                    {option.value}
                  </a>
                ) : option.type === 'link' ? (
                  <a
                    href={option.link}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-link"
                  >
                    {option.value}
                  </a>
                ) : (
                  <p className="contact-text">{option.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="contact-form-section">
          <h2 className="section-title">Send a Message</h2>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                rows="6"
                className="form-textarea"
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {submitted && (
              <div className="success-message">✨ Message sent! I'll get back to you soon.</div>
            )}

            <button type="submit" className="submit-button" disabled={submitted}>
              {submitted ? '✓ Sent!' : 'Send Message'}
            </button>
          </form>

          <p className="form-note">
            💡 Or reach out directly via email or LinkedIn for faster response
          </p>
        </section>
      </div>

      {/* Social Links Section */}
      <section className="social-section">
        <h2 className="gradient-text-secondary">Let's Connect</h2>
        <p>Follow me on social media or check out my work</p>
        <div className="social-links">
          {personal.linkedin && (
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="social-link"
              aria-label="LinkedIn"
            >
              <span className="social-icon">💼</span>
              <span>LinkedIn</span>
            </a>
          )}
          {personal.github && (
            <a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className="social-link"
              aria-label="GitHub"
            >
              <span className="social-icon">🐙</span>
              <span>GitHub</span>
            </a>
          )}
          {personal.portfolio && (
            <a
              href={personal.portfolio}
              target="_blank"
              rel="noreferrer"
              className="social-link"
              aria-label="Portfolio"
            >
              <span className="social-icon">🌐</span>
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

export default Contact;
