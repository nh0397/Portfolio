import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import "./Chatbot.css";
import ChatbotService from "../../../services/ChatbotService";
import VoiceAgentService from "../../../services/VoiceAgentService";
import { AppContext } from "../../../context/AppContext";
import { ui } from "../../../config/portfolioConfig";

/** Section name → tab number in Content.jsx's switch. */
const SECTION_TABS = {
  home: 1,
  about: 2,
  skills: 2,
  projects: 3,
  experience: 4,
  education: 4,
  contact: 5,
};

const SECTION_LABELS = {
  home: "Home",
  about: "About",
  skills: "Skills",
  projects: "Projects",
  experience: "Experience",
  education: "Experience",
  contact: "Contact",
};

const SUGGESTIONS = [
  "What's he working on now?",
  "Show me his projects",
  "Take me to his experience",
  "What's his AI stack?",
  "How do I contact him?",
];

const greeting = () => ({
  id: `bot-${Date.now()}`,
  isBot: true,
  html: ui.chatbot.initialMessage,
  timestamp: new Date(),
});

const Chatbot = ({ isOpen, onClose }) => {
  const { setActiveFile } = useContext(AppContext);

  const [messages, setMessages] = useState(() => {
    const saved = ChatbotService.loadConversationFromSession();
    return saved.length ? saved : [greeting()];
  });
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const voiceSupported = VoiceAgentService.isSupported();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const handsFreeRef = useRef(false);
  const sendRef = useRef(null);

  /* ---------- effects ---------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 320);
  }, [isOpen]);

  useEffect(() => {
    if (messages.length) ChatbotService.saveConversationToSession(messages);
  }, [messages]);

  // Esc closes the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* ---------- navigation ---------- */

  const navigate = useCallback(
    (section) => {
      const tab = SECTION_TABS[section];
      if (tab) setActiveFile(tab);
    },
    [setActiveFile]
  );

  /* ---------- sending ---------- */

  const send = useCallback(
    async (rawText, viaVoice = false) => {
      const text = (rawText ?? "").trim();
      if (!text || isLoading) return;

      const outgoing = {
        id: `user-${Date.now()}`,
        isBot: false,
        html: text,
        isVoice: viaVoice,
        timestamp: new Date(),
      };

      const history = ChatbotService.formatConversationHistory([...messages, outgoing]);
      setMessages((prev) => [...prev, outgoing]);
      setUserInput("");
      setIsLoading(true);

      // Navigate immediately — don't make the user wait on the LLM round-trip.
      const section = VoiceAgentService.detectNavigationIntent(text);
      if (section) navigate(section);

      try {
        const res = await ChatbotService.sendMessage(text, history, viaVoice);
        const reply = {
          id: `bot-${Date.now()}`,
          isBot: true,
          html: res.response,
          navigatedTo: section ? SECTION_LABELS[section] : null,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, reply]);

        if (viaVoice && voiceSupported) VoiceAgentService.speak(res.response);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            isBot: true,
            isError: true,
            html: "I couldn't reach my backend just then. Give it another go in a moment.",
            retry: text,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, navigate, voiceSupported]
  );

  // Keep a stable handle so the voice callbacks always call the latest send().
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  /* ---------- voice wiring ---------- */

  useEffect(() => {
    VoiceAgentService.onListeningStateChange = setIsListening;
    VoiceAgentService.onSpeakingStateChange = setIsSpeaking;
    VoiceAgentService.onTranscriptChange = setUserInput;

    VoiceAgentService.onError = (err) => {
      if (err === "aborted" || err === "no-speech") return;
      setVoiceError(
        err === "not-allowed"
          ? "Microphone blocked — enable it in your browser settings."
          : `Voice error: ${err}`
      );
      setTimeout(() => setVoiceError(""), 4000);
    };

    // Fires once speech is final, so hands-free never needs a click.
    VoiceAgentService.onFinalTranscript = (transcript) => {
      const text = transcript.trim();
      if (text) sendRef.current?.(text, true);
    };

    return () => {
      VoiceAgentService.onListeningStateChange = null;
      VoiceAgentService.onSpeakingStateChange = null;
      VoiceAgentService.onTranscriptChange = null;
      VoiceAgentService.onError = null;
      VoiceAgentService.onFinalTranscript = null;
    };
  }, []);

  // Hands-free loop: as soon as we stop speaking and aren't busy, listen again.
  useEffect(() => {
    if (!handsFree || isListening || isSpeaking || isLoading) return;
    const t = setTimeout(() => {
      if (handsFreeRef.current) VoiceAgentService.startListening();
    }, 600);
    return () => clearTimeout(t);
  }, [handsFree, isListening, isSpeaking, isLoading]);

  const toggleMic = () => {
    if (isListening) {
      VoiceAgentService.stopListening();
    } else {
      VoiceAgentService.stopSpeaking();
      VoiceAgentService.startListening();
    }
  };

  const toggleHandsFree = () => {
    const next = !handsFree;
    setHandsFree(next);
    handsFreeRef.current = next;

    if (next) {
      VoiceAgentService.speak("Hands-free on. Ask me anything about Naisarg.");
    } else {
      VoiceAgentService.stopListening();
      VoiceAgentService.stopSpeaking();
    }
  };

  const clearChat = () => {
    VoiceAgentService.stopSpeaking();
    ChatbotService.clearConversationSession();
    setMessages([greeting()]);
  };

  /* ---------- status line ---------- */

  const status = isListening
    ? { text: "Listening…", tone: "listening" }
    : isSpeaking
    ? { text: "Speaking…", tone: "speaking" }
    : isLoading
    ? { text: "Thinking…", tone: "thinking" }
    : handsFree
    ? { text: "Hands-free on", tone: "ready" }
    : { text: "Ask me anything", tone: "idle" };

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <aside
      className={`ai-panel ${isOpen ? "open" : "closed"}`}
      aria-hidden={!isOpen}
      aria-label="AI assistant"
    >
      <header className="ai-header">
        <div className="ai-identity">
          <span className={`ai-orb ${status.tone}`} aria-hidden="true" />
          <div>
            <h2>Naisarg&apos;s AI</h2>
            <p className={`ai-status ${status.tone}`}>{status.text}</p>
          </div>
        </div>

        <div className="ai-actions">
          {voiceSupported && (
            <button
              className={`icon-btn ${handsFree ? "on" : ""}`}
              onClick={toggleHandsFree}
              title={handsFree ? "Turn off hands-free" : "Turn on hands-free"}
              aria-pressed={handsFree}
            >
              {handsFree ? "🔊" : "🎧"}
            </button>
          )}
          <button className="icon-btn" onClick={clearChat} title="Clear conversation">
            ⟲
          </button>
          <button className="icon-btn" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>
      </header>

      {voiceError && <div className="ai-banner error">{voiceError}</div>}

      <div className="ai-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`bubble-row ${msg.isBot ? "bot" : "user"}`}>
            <div className={`bubble ${msg.isError ? "error" : ""}`}>
              {msg.isBot ? (
                // Backend returns light HTML (<b>, <ul>, <li>) from its own formatter.
                <div
                  className="bubble-body"
                  dangerouslySetInnerHTML={{ __html: msg.html }}
                />
              ) : (
                <div className="bubble-body">{msg.html}</div>
              )}

              {msg.navigatedTo && (
                <button
                  className="nav-chip"
                  onClick={() => navigate(msg.navigatedTo.toLowerCase())}
                >
                  ↗ Opened {msg.navigatedTo}
                </button>
              )}

              {msg.isVoice && <span className="voice-tag">🎙 voice</span>}

              {msg.retry && (
                <button className="retry-btn" onClick={() => send(msg.retry)}>
                  Try again
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="bubble-row bot">
            <div className="bubble">
              <div className="dots" aria-label="Thinking">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="ai-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="ai-composer">
        <textarea
          ref={inputRef}
          className="ai-input"
          rows={1}
          value={userInput}
          placeholder={isListening ? "Listening…" : "Ask about his work, or say “show me projects”"}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(userInput);
            }
          }}
          disabled={isLoading}
        />

        {voiceSupported && (
          <button
            className={`mic-btn ${isListening ? "live" : ""}`}
            onClick={toggleMic}
            disabled={isLoading}
            title={isListening ? "Stop listening" : "Speak"}
            aria-pressed={isListening}
          >
            🎙
          </button>
        )}

        {isSpeaking ? (
          <button
            className="send-btn stop"
            onClick={() => VoiceAgentService.stopSpeaking()}
            title="Stop speaking"
          >
            ■
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={() => send(userInput)}
            disabled={isLoading || !userInput.trim()}
            title="Send"
          >
            ↑
          </button>
        )}
      </div>
    </aside>
  );
};

export default Chatbot;
