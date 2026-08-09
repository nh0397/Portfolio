// VoiceAgentService — speech-to-text, navigation intent, and text-to-speech.

// Words that turn a mention into a request to actually go somewhere.
const NAV_VERBS = [
  "go to", "take me", "show me", "show", "open", "navigate", "jump to",
  "switch to", "bring up", "pull up", "let's see", "see his", "see the",
  "view", "visit", "head to",
];

// Longest phrase wins, so "work experience" beats a bare "work".
const SECTION_KEYWORDS = {
  contact: ["contact", "get in touch", "reach him", "reach out", "email him", "hire", "phone number"],
  projects: ["projects", "project", "portfolio work", "repos", "repositories", "github", "what he built", "what has he built"],
  experience: ["experience", "work history", "career", "resume", "cv", "employment", "jobs", "worked at", "education", "degree", "school"],
  about: ["about", "about him", "who is he", "bio", "background", "summary", "skills", "tech stack", "technologies"],
  home: ["home", "homepage", "landing page", "start over", "top of the page"],
};

class VoiceAgentService {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.transcript = "";
    this.currentUtterance = null;

    // Callbacks — assigned by the component that owns the UI.
    this.onTranscriptChange = null;
    this.onListeningStateChange = null;
    this.onSpeakingStateChange = null;
    this.onFinalTranscript = null;
    this.onError = null;

    this._finalBuffer = "";

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser");
      this.recognition = null;
    } else {
      this.recognition = new SpeechRecognition();
      this._setupRecognition();
    }

    this.synth = window.speechSynthesis || null;
  }

  _setupRecognition() {
    const rec = this.recognition;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      this.isListening = true;
      this.transcript = "";
      this._finalBuffer = "";
      this.onListeningStateChange?.(true);
    };

    rec.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += chunk;
        else interim += chunk;
      }

      if (final) this._finalBuffer += final;
      this.transcript = (this._finalBuffer + interim).trim();
      this.onTranscriptChange?.(this.transcript);
    };

    rec.onend = () => {
      this.isListening = false;
      this.onListeningStateChange?.(false);

      // Hand the finished utterance to the owner so hands-free needs no click.
      const finished = (this._finalBuffer || this.transcript).trim();
      this._finalBuffer = "";
      if (finished) this.onFinalTranscript?.(finished);
    };

    rec.onerror = (event) => {
      this.isListening = false;
      this.onListeningStateChange?.(false);
      this.onError?.(event.error);
    };
  }

  startListening() {
    if (!this.recognition) {
      this.onError?.("Speech recognition is not supported in this browser");
      return;
    }
    if (this.isListening) return;

    // Never listen to our own voice.
    this.stopSpeaking();

    try {
      this.recognition.start();
    } catch {
      // start() throws if the engine is still winding down; the hands-free
      // loop will retry on its next tick.
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) this.recognition.stop();
  }

  /**
   * Which section the user is asking to see, or null.
   *
   * Requires either an explicit navigation verb ("show me projects") or a
   * message that is essentially just the section name ("projects"), so
   * ordinary questions like "what did he do at Mu Sigma" don't yank the tab.
   */
  detectNavigationIntent(text) {
    const lower = (text || "").toLowerCase().trim();
    if (!lower) return null;

    const hasNavVerb = NAV_VERBS.some((verb) => lower.includes(verb));
    const isTerse = lower.split(/\s+/).length <= 3;
    if (!hasNavVerb && !isTerse) return null;

    let best = null;
    let bestLength = 0;

    for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword) && keyword.length > bestLength) {
          best = section;
          bestLength = keyword.length;
        }
      }
    }

    return best;
  }

  /** Strip the backend's HTML so the synthesizer doesn't read out tags. */
  _toSpeech(html) {
    return (html || "")
      .replace(/<li>/gi, " • ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "and")
      .replace(/\s+/g, " ")
      .trim();
  }

  speak(text) {
    if (!this.synth) return;

    const plain = this._toSpeech(text);
    if (!plain) return;

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = this._preferredVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onSpeakingStateChange?.(true);
    };

    const done = () => {
      this.isSpeaking = false;
      this.onSpeakingStateChange?.(false);
    };
    utterance.onend = done;
    utterance.onerror = done;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /** Prefer a natural-sounding en-US voice when the platform offers one. */
  _preferredVoice() {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (!voices.length) return null;

    const preferred = ["Samantha", "Google US English", "Alex", "Daniel"];
    for (const name of preferred) {
      const match = voices.find((v) => v.name.includes(name));
      if (match) return match;
    }
    return voices.find((v) => v.lang === "en-US") || voices[0];
  }

  stopSpeaking() {
    if (!this.synth) return;
    this.synth.cancel();
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.onSpeakingStateChange?.(false);
    }
  }

  isSupported() {
    return Boolean(this.recognition && this.synth);
  }

  getIsSpeaking() {
    return this.isSpeaking;
  }

  getIsListening() {
    return this.isListening;
  }
}

export default new VoiceAgentService();
