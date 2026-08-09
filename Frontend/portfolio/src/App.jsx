import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import About from "./components/About";
import Contact from "./components/Contact";
import Assistant from "./components/Assistant";
import { useReveal } from "./lib/useReveal";

export default function App() {
  const [assistantOpen, setAssistantOpen] = useState(false);

  useReveal();

  // ⌘K / Ctrl-K opens the assistant from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAssistantOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="ambient" aria-hidden="true" />

      <div className={`shell ${assistantOpen ? "docked" : ""}`}>
        <Nav
          assistantOpen={assistantOpen}
          onOpenAssistant={() => setAssistantOpen((v) => !v)}
        />

        <main>
          <Hero onOpenAssistant={() => setAssistantOpen(true)} />
          <Work />
          <Experience />
          <Skills />
          <About />
          <Contact onOpenAssistant={() => setAssistantOpen(true)} />
        </main>
      </div>

      <Assistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
