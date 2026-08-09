import { useCallback, useEffect, useRef, useState } from "react";
import { askAssistant, loadThread, saveThread, clearThread } from "../lib/chatApi";
import voice from "../lib/voice";
import { scrollToSection } from "../lib/scrollToSection";
import FitCheck from "./FitCheck";
import { SparkIcon, MicIcon, ArrowIcon } from "./Icons";
import "./Assistant.css";

const SECTION_LABEL = {
  top: "Top",
  work: "Work",
  experience: "Experience",
  skills: "Skills",
  about: "About",
  contact: "Contact",
};

const OPENERS = [
  "What is he working on right now?",
  "Show me his best project",
  "What's his AI stack?",
  "Is he a fit for a backend role?",
  "Take me to his experience",
];

const greeting = () => ({
  id: "greet",
  isBot: true,
  html:
    "Hi — I'm Naisarg's assistant. I've read his résumé, every public repo and his LinkedIn history, so ask me anything specific. I can also jump you around this page.",
});

export default function Assistant({ open, onClose }) {
  const [messages, setMessages] = useState(() => {
    const saved = loadThread();
    return saved.length ? saved : [greeting()];
  });
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState("chat");

  const inputRef = useRef(null);
  const threadRef = useRef(null);
  const sendRef = useRef(null);
  const handsFreeRef = useRef(false);

  /* ---------- focus ----------
     The panel animates in, so focusing on the same tick lands on a still-hidden
     element and silently does nothing. Wait for the transition, then focus. */

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 380);
    return () => clearTimeout(t);
  }, [open]);

  // Return focus to the field whenever the assistant finishes replying.
  useEffect(() => {
    if (open && !busy) inputRef.current?.focus();
  }, [busy, open]);

  // Scroll the thread by setting its own scrollTop. scrollIntoView would also
  // scroll every ancestor, which fights the page-level jump when a question
  // triggers navigation.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, busy]);

  useEffect(() => saveThread(messages), [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ---------- navigation ---------- */

  const goTo = useCallback((section) => {
    scrollToSection(section);
  }, []);

  /* ---------- send ---------- */

  const send = useCallback(
    async (raw, viaVoice = false) => {
      const text = (raw ?? "").trim();
      if (!text || busy) return;

      const outgoing = { id: `u${Date.now()}`, isBot: false, html: text, viaVoice };
      const thread = [...messages, outgoing];

      setMessages(thread);
      setDraft("");
      setBusy(true);

      // Scroll right away rather than after the model round-trip.
      const section = voice.detectSection(text);
      if (section) goTo(section);

      try {
        const reply = await askAssistant(text, thread, { voice: viaVoice });
        setMessages((prev) => [
          ...prev,
          {
            id: `b${Date.now()}`,
            isBot: true,
            html: reply,
            jumped: section ? SECTION_LABEL[section] : null,
            sectionId: section,
          },
        ]);
        // Speak when the question was spoken, and also whenever hands-free is
        // on — in that mode the reply should come back aloud even if the
        // visitor typed it or tapped a suggestion.
        if (viaVoice || handsFreeRef.current) voice.speak(reply);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e${Date.now()}`,
            isBot: true,
            isError: true,
            html: "I couldn't reach the backend just then. Try again in a moment.",
            retry: text,
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [messages, busy, goTo]
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  /* ---------- voice wiring ---------- */

  useEffect(() => {
    voice.onListening = setListening;
    voice.onSpeaking = setSpeaking;
    voice.onTranscript = setDraft;
    voice.onFinal = (t) => t.trim() && sendRef.current?.(t, true);

    voice.onError = (err) => {
      if (err === "aborted" || err === "no-speech") return;
      setNotice(
        err === "not-allowed"
          ? "Microphone blocked — enable it in your browser settings."
          : err === "unsupported"
          ? "This browser doesn't support speech recognition."
          : `Voice error: ${err}`
      );
      setTimeout(() => setNotice(""), 4200);
    };

    return () => {
      voice.onListening = null;
      voice.onSpeaking = null;
      voice.onTranscript = null;
      voice.onFinal = null;
      voice.onError = null;
    };
  }, []);

  // Hands-free: once we're done speaking and idle, listen again.
  useEffect(() => {
    if (!handsFree || listening || speaking || busy) return;
    const t = setTimeout(() => handsFreeRef.current && voice.start(), 650);
    return () => clearTimeout(t);
  }, [handsFree, listening, speaking, busy]);

  const toggleHandsFree = () => {
    const next = !handsFree;
    setHandsFree(next);
    handsFreeRef.current = next;
    if (next) voice.speak("Hands-free on. Ask me anything.");
    else {
      voice.stop();
      voice.stopSpeaking();
    }
  };

  const reset = () => {
    voice.stopSpeaking();
    clearThread();
    setMessages([greeting()]);
    inputRef.current?.focus();
  };

  const status = listening
    ? { text: "Listening", tone: "listen" }
    : speaking
    ? { text: "Speaking", tone: "speak" }
    : busy
    ? { text: "Thinking", tone: "think" }
    : handsFree
    ? { text: "Hands-free on", tone: "ready" }
    : { text: "Ready", tone: "idle" };

  const showOpeners = messages.length <= 1 && !busy;

  return (
    <aside
      className={`assistant ${open ? "open" : ""}`}
      aria-hidden={!open}
      aria-label="AI assistant"
    >
      <header className="as-head">
        <div className="as-id">
          <span className={`as-orb ${status.tone}`} aria-hidden="true" />
          <div>
            <h2>
              <SparkIcon size={14} /> Ask about Naisarg
            </h2>
            <p className={`as-status ${status.tone}`}>{status.text}</p>
          </div>
        </div>

        <div className="as-tools">
          {voice.supported && (
            <button
              className={`as-icon ${handsFree ? "on" : ""}`}
              onClick={toggleHandsFree}
              aria-pressed={handsFree}
              title={handsFree ? "Turn off hands-free" : "Hands-free mode"}
            >
              {handsFree ? "🔊" : "🎧"}
            </button>
          )}
          <button className="as-icon" onClick={reset} title="New conversation">⟲</button>
          <button className="as-icon" onClick={onClose} title="Close (Esc)">✕</button>
        </div>
      </header>

      {notice && <p className="as-notice">{notice}</p>}

      <div className="as-modes" role="tablist" aria-label="Assistant mode">
        <button
          role="tab"
          aria-selected={mode === "chat"}
          className={mode === "chat" ? "on" : ""}
          onClick={() => setMode("chat")}
        >
          Chat
        </button>
        <button
          role="tab"
          aria-selected={mode === "fit"}
          className={mode === "fit" ? "on" : ""}
          onClick={() => setMode("fit")}
        >
          Role fit
        </button>
      </div>

      {mode === "fit" && (
        <FitCheck
          busy={busy}
          onAskForWriteup={(prompt) => {
            setMode("chat");
            send(prompt);
          }}
        />
      )}

      <div className="as-thread" ref={threadRef} hidden={mode !== "chat"}>
        {messages.map((m) => (
          <div key={m.id} className={`as-row ${m.isBot ? "bot" : "user"}`}>
            <div className={`as-bubble ${m.isError ? "err" : ""}`}>
              {m.isBot ? (
                // The backend emits its own small HTML subset (<b>, <i>, <ul>).
                <div className="as-text" dangerouslySetInnerHTML={{ __html: m.html }} />
              ) : (
                <div className="as-text">{m.html}</div>
              )}

              {m.jumped && (
                <button className="as-jump" onClick={() => goTo(m.sectionId)}>
                  <ArrowIcon size={13} /> Jumped to {m.jumped}
                </button>
              )}

              {m.retry && (
                <button className="as-jump" onClick={() => send(m.retry)}>
                  Try again
                </button>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="as-row bot">
            <div className="as-bubble">
              <span className="as-dots" aria-label="Thinking">
                <i /><i /><i />
              </span>
            </div>
          </div>
        )}

      </div>

      {mode === "chat" && showOpeners && (
        <div className="as-openers">
          {OPENERS.map((o) => (
            <button key={o} onClick={() => send(o)}>{o}</button>
          ))}
        </div>
      )}

      <div className="as-composer" hidden={mode !== "chat"}>
        <textarea
          ref={inputRef}
          className="as-input"
          rows={1}
          value={draft}
          disabled={busy}
          placeholder={listening ? "Listening…" : "Ask anything, or say “show me his work”"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
        />

        {voice.supported && (
          <button
            className={`as-mic ${listening ? "live" : ""}`}
            onClick={() => (listening ? voice.stop() : voice.start())}
            disabled={busy}
            aria-pressed={listening}
            title={listening ? "Stop listening" : "Speak"}
          >
            <MicIcon />
          </button>
        )}

        {speaking ? (
          <button className="as-send stop" onClick={() => voice.stopSpeaking()} title="Stop speaking">
            ■
          </button>
        ) : (
          <button
            className="as-send"
            onClick={() => send(draft)}
            disabled={busy || !draft.trim()}
            title="Send"
          >
            <ArrowIcon size={17} />
          </button>
        )}
      </div>
    </aside>
  );
}
