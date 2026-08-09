import React, { useState } from "react";
import "./Contact.css";
import { portfolioConfig } from "../../../config/portfolioConfig";

/* Official brand marks — inline so nothing depends on an icon CDN. */

const GmailIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path fill="#4285F4" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    <path fill="#34A853" d="M1.636 21.002h3.819V11.73L0 7.91v11.456c0 .904.732 1.636 1.636 1.636z" />
    <path fill="#FBBC04" d="M18.545 4.638v7.092L24 7.91V5.457c0-2.023-2.309-3.178-3.927-1.964z" />
    <path fill="#EA4335" d="M5.455 11.73V4.638L12 9.548l6.545-4.91v7.092L12 16.64z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path
      fill="#0A66C2"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
    <path
      fill="#f5f5f4"
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="#ffc83d" aria-hidden="true">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="#ffc83d" aria-hidden="true">
    <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
  </svg>
);

function Contact() {
  const { personal } = portfolioConfig;
  const [copied, setCopied] = useState("");

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const channels = [
    {
      id: "email",
      icon: <GmailIcon />,
      label: "Email",
      value: personal.email,
      href: `mailto:${personal.email}`,
      cta: "Send an email",
      copyable: true,
    },
    {
      id: "linkedin",
      icon: <LinkedInIcon />,
      label: "LinkedIn",
      value: "in/naisarg-h",
      href: personal.linkedin,
      cta: "Connect",
    },
    {
      id: "github",
      icon: <GitHubIcon />,
      label: "GitHub",
      value: "@nh0397",
      href: personal.github,
      cta: "View repositories",
    },
    {
      id: "phone",
      icon: <PhoneIcon />,
      label: "Phone",
      value: personal.phone,
      href: `tel:${(personal.phone || "").replace(/[^\d+]/g, "")}`,
      cta: "Call",
      copyable: true,
    },
  ];

  return (
    <div className="contact-page">
      <header className="contact-hero">
        <p className="eyebrow">Contact</p>
        <h1>Let&apos;s build something</h1>
        <p className="lede">
          Open to Applied AI and backend engineering roles. The fastest way to
          reach me is email — I read everything.
        </p>
        <div className="availability">
          <span className="pulse-dot" aria-hidden="true" />
          Based in {personal.location} · Open to remote
        </div>
      </header>

      <section className="channels">
        {channels.map((ch) => (
          <div key={ch.id} className="channel-card">
            <div className="channel-icon">{ch.icon}</div>

            <div className="channel-body">
              <h3>{ch.label}</h3>
              <p className="channel-value">{ch.value}</p>
            </div>

            <div className="channel-actions">
              <a
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="channel-cta"
              >
                {ch.cta} →
              </a>
              {ch.copyable && (
                <button
                  className="copy-btn"
                  onClick={() => copy(ch.id, ch.value)}
                  title={`Copy ${ch.label.toLowerCase()}`}
                >
                  {copied === ch.id ? "✓ Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="contact-cta">
        <h2>Prefer to just ask?</h2>
        <p>
          My AI assistant knows my whole résumé, every repo and each project —
          open it from the toolbar and ask it anything.
        </p>
        <a className="portfolio-link" href={personal.portfolio} target="_blank" rel="noreferrer">
          {personal.portfolio.replace(/^https?:\/\//, "")} ↗
        </a>
      </section>
    </div>
  );
}

export default Contact;
