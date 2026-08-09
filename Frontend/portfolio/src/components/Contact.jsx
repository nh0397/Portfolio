import { useState } from "react";
import data from "../data/portfolioData.json";
import { GmailIcon, LinkedInIcon, GitHubIcon, SparkIcon, ArrowIcon } from "./Icons";
import "./Contact.css";

export default function Contact({ onOpenAssistant }) {
  const { personal } = data;
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1900);
    } catch {
      /* Clipboard blocked — the mailto link below still works. */
    }
  };

  const channels = [
    {
      id: "email",
      icon: <GmailIcon size={24} brand />,
      label: "Email",
      value: personal.email,
      href: `mailto:${personal.email}`,
      cta: "Compose",
    },
    {
      id: "linkedin",
      icon: <LinkedInIcon size={24} brand />,
      label: "LinkedIn",
      value: "in/naisarg-h",
      href: personal.linkedin,
      cta: "Connect",
    },
    {
      id: "github",
      icon: <GitHubIcon size={24} brand />,
      label: "GitHub",
      value: "@nh0397",
      href: personal.github,
      cta: "Follow",
    },
  ];

  return (
    <section id="contact" className="section contact">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="section-num">05 — Contact</p>
          <h2 className="section-title">Let&apos;s talk</h2>
          <p className="section-sub">
            Open to Applied AI and backend engineering roles. Email gets the
            fastest reply — I read every one.
          </p>
        </header>

        <div className="contact-grid reveal">
          {channels.map((c) => (
            <a
              key={c.id}
              className="channel"
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <span className="channel-icon">{c.icon}</span>
              <span className="channel-body">
                <span className="channel-label">{c.label}</span>
                <span className="channel-value">{c.value}</span>
              </span>
              <span className="channel-cta">
                {c.cta}
                <ArrowIcon size={15} />
              </span>
            </a>
          ))}
        </div>

        <div className="contact-tools reveal">
          <button className="tool-btn" onClick={copyEmail}>
            {copied ? "✓ Email copied" : "Copy email address"}
          </button>
          <span className="tool-sep" aria-hidden="true">·</span>
          <span className="tool-note mono">{personal.location} · open to remote</span>
        </div>

        <div className="ask-panel reveal">
          <div className="ask-copy">
            <h3>
              <SparkIcon size={19} />
              Rather just ask?
            </h3>
            <p>
              This site ships with an assistant trained on my résumé, every
              repository and my LinkedIn history. Ask it what I&apos;ve shipped,
              which stack I know best, or whether I fit a role you&apos;re hiring
              for — it answers from the record, and it&apos;ll jump you to the
              relevant section.
            </p>
          </div>
          <button className="btn btn-primary" onClick={onOpenAssistant}>
            <SparkIcon size={16} />
            Open the assistant
          </button>
        </div>
      </div>

      <footer className="foot">
        <div className="wrap foot-inner">
          <span>© {new Date().getFullYear()} Naisarg Halvadiya</span>
          <span className="foot-meta mono">
            React · Vite · RAG on MongoDB Atlas — data synced {data.generatedAt}
          </span>
        </div>
      </footer>
    </section>
  );
}
