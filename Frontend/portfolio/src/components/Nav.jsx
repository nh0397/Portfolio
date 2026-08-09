import { useEffect, useState } from "react";
import { sections } from "../data/content";
import { useScrollSpy } from "../lib/useReveal";
import { scrollToSection } from "../lib/scrollToSection";
import { SparkIcon } from "./Icons";
import "./Nav.css";

export default function Nav({ onOpenAssistant, assistantOpen }) {
  const [active, setActive] = useState("top");
  const [scrolled, setScrolled] = useState(false);

  useScrollSpy(
    sections.map((s) => s.id),
    setActive
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav-solid" : ""}`}>
      <div className="wrap nav-inner">
        <a
          href="#top"
          className="nav-mark"
          aria-label="Back to top"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("top");
          }}
        >
          <span className="mark-badge">NH</span>
          <span className="mark-name">Naisarg Halvadiya</span>
        </a>

        <nav className="nav-links" aria-label="Sections">
          {sections
            .filter((s) => s.id !== "top")
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={active === s.id ? "active" : ""}
                aria-current={active === s.id ? "true" : undefined}
                onClick={(e) => {
                  // Keep the href for middle-click / copy-link, but scroll
                  // through the shared helper so the offset is consistent.
                  e.preventDefault();
                  scrollToSection(s.id);
                  history.replaceState(null, "", `#${s.id}`);
                }}
              >
                {s.label}
              </a>
            ))}
        </nav>

        <button
          className={`nav-ask ${assistantOpen ? "on" : ""}`}
          onClick={onOpenAssistant}
          aria-pressed={assistantOpen}
        >
          <SparkIcon size={15} />
          <span>Ask my AI</span>
        </button>
      </div>
    </header>
  );
}
