// Speech in / speech out, plus the intent check that decides when a question
// should also scroll the page.

const NAV_VERBS = [
  "go to", "take me", "show me", "show", "open", "navigate", "jump to",
  "scroll to", "switch to", "bring up", "pull up", "view", "see the", "head to",
];

// Longest match wins, so "work experience" beats a bare "work".
const SECTION_TERMS = {
  contact: ["contact", "get in touch", "reach him", "reach out", "email him", "hire"],
  work: ["work", "projects", "project", "portfolio", "built", "shipped", "repos", "repositories"],
  experience: ["experience", "work history", "career", "resume", "cv", "employment", "jobs", "roles"],
  skills: ["skills", "skill", "tech stack", "stack", "technologies", "capabilities", "proficien"],
  about: ["about", "background", "education", "degree", "school", "awards", "certifications", "bio"],
  top: ["top", "home", "start", "beginning", "hero"],
};

class Voice {
  constructor() {
    this.listening = false;
    this.speaking = false;
    this.transcript = "";
    this._final = "";

    this.onTranscript = null;
    this.onListening = null;
    this.onSpeaking = null;
    this.onFinal = null;
    this.onError = null;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.rec = SR ? new SR() : null;
    this.synth = window.speechSynthesis || null;

    if (this.rec) this._setup();
  }

  _setup() {
    const rec = this.rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      this.listening = true;
      this.transcript = "";
      this._final = "";
      this.onListening?.(true);
    };

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) this._final += chunk;
        else interim += chunk;
      }
      this.transcript = (this._final + interim).trim();
      this.onTranscript?.(this.transcript);
    };

    rec.onend = () => {
      this.listening = false;
      this.onListening?.(false);

      const finished = (this._final || this.transcript).trim();
      this._final = "";
      if (finished) this.onFinal?.(finished);
    };

    rec.onerror = (e) => {
      this.listening = false;
      this.onListening?.(false);
      this.onError?.(e.error);
    };
  }

  start() {
    if (!this.rec) {
      this.onError?.("unsupported");
      return;
    }
    if (this.listening) return;
    this.stopSpeaking();
    try {
      this.rec.start();
    } catch {
      /* Engine still winding down; the hands-free loop retries. */
    }
  }

  stop() {
    if (this.rec && this.listening) this.rec.stop();
  }

  /**
   * Section to scroll to, or null. Needs an explicit navigation verb or a very
   * short query — otherwise "what did he do at Mu Sigma" would yank the page.
   */
  detectSection(text) {
    const lower = (text || "").toLowerCase().trim();
    if (!lower) return null;

    const hasVerb = NAV_VERBS.some((v) => lower.includes(v));
    const terse = lower.split(/\s+/).length <= 3;
    if (!hasVerb && !terse) return null;

    let best = null;
    let bestLen = 0;
    for (const [section, terms] of Object.entries(SECTION_TERMS)) {
      for (const term of terms) {
        if (lower.includes(term) && term.length > bestLen) {
          best = section;
          bestLen = term.length;
        }
      }
    }
    return best;
  }

  _plain(html) {
    return (html || "")
      .replace(/<li>/gi, " • ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "and")
      .replace(/\s+/g, " ")
      .trim();
  }

  speak(html) {
    if (!this.synth) return;
    const text = this._plain(html);
    if (!text) return;

    this.synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.03;
    u.pitch = 1;
    u.volume = 1;

    const voice = this._voice();
    if (voice) u.voice = voice;

    u.onstart = () => {
      this.speaking = true;
      this.onSpeaking?.(true);
    };
    const done = () => {
      this.speaking = false;
      this.onSpeaking?.(false);
    };
    u.onend = done;
    u.onerror = done;

    this.synth.speak(u);
  }

  _voice() {
    const voices = this.synth?.getVoices() || [];
    if (!voices.length) return null;
    for (const name of ["Samantha", "Google US English", "Alex", "Daniel"]) {
      const hit = voices.find((v) => v.name.includes(name));
      if (hit) return hit;
    }
    return voices.find((v) => v.lang === "en-US") || voices[0];
  }

  stopSpeaking() {
    if (!this.synth) return;
    this.synth.cancel();
    if (this.speaking) {
      this.speaking = false;
      this.onSpeaking?.(false);
    }
  }

  get supported() {
    return Boolean(this.rec && this.synth);
  }
}

export default new Voice();
