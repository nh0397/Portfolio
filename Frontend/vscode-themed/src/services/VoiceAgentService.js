class VoiceAgentService {
  constructor() {
    this.isListening = false;
    this.transcript = '';
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.onTranscriptChange = null;
    this.onListeningStateChange = null;
    this.onError = null;
    this.onSpeakingStateChange = null;
    this.speechTimeout = null;
    this.minConfidence = 0.5;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      this.recognition = null;
    } else {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    this.synth = window.speechSynthesis;
  }

  setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.language = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = '';
      if (this.onListeningStateChange) this.onListeningStateChange(true);
      if (this.speechTimeout) clearTimeout(this.speechTimeout);
    };

    this.recognition.onresult = (event) => {
      this.transcript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        this.transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      if (this.onTranscriptChange) this.onTranscriptChange(this.transcript);

      if (isFinal) {
        this.speechTimeout = setTimeout(() => {
          this.recognition.stop();
        }, 500);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onListeningStateChange) this.onListeningStateChange(false);
      if (this.speechTimeout) clearTimeout(this.speechTimeout);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) this.onError(event.error);
      this.isListening = false;
      if (this.onListeningStateChange) this.onListeningStateChange(false);
    };
  }

  startListening() {
    if (!this.recognition) {
      if (this.onError) this.onError('Web Speech API not supported');
      return;
    }
    this.transcript = '';
    this.recognition.start();
  }

  stopListening() {
    if (!this.recognition) return;
    this.recognition.stop();
  }

  getFinalTranscript() {
    return this.transcript;
  }

  // Enhanced navigation detection with better scoring
  detectNavigationIntent(text) {
    const lowerText = text.toLowerCase();

    const navigationMap = {
      home: ['home', 'go home', 'homepage', 'start', 'back to start', 'main page'],
      about: ['about', 'about you', 'who are you', 'introduce', 'bio', 'background', 'tell me about yourself'],
      projects: ['project', 'projects', 'built', 'portfolio', 'created', 'showcase', 'work', 'what have you built', 'show me your work'],
      experience: ['experience', 'work', 'job', 'employment', 'career', 'resume', 'background', 'history', 'worked at', 'education'],
      contact: ['contact', 'email', 'reach', 'get in touch', 'phone', 'connect', 'hire', 'collaborate', 'message'],
      skills: ['skill', 'technology', 'tech stack', 'tools', 'languages', 'expertise', 'proficient', 'what can you do'],
    };

    let bestMatch = null;
    let bestScore = 0;

    for (const [section, keywords] of Object.entries(navigationMap)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          score += keyword.length;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = section;
      }
    }

    return bestMatch;
  }

  // Advanced speech synthesis with better control
  speak(text) {
    if (!this.synth) return;

    this.synth.cancel();
    const plainText = text.replace(/<[^>]*>/g, '').trim();

    if (!plainText) return;

    const utterance = new SpeechSynthesisUtterance(plainText);

    // Better voice parameters
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = this.synth.getVoices();
    const preferredVoice = voices.find((v) => v.lang === 'en-US') || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
    }
  }

  // Check if supported
  isSupported() {
    return !!this.recognition && !!this.synth;
  }

  getIsSpeaking() {
    return this.isSpeaking;
  }

  getIsListening() {
    return this.isListening;
  }

  // Get available voices
  getAvailableVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  // Set voice preference
  setVoicePreference(voiceIndex) {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voiceIndex >= 0 && voiceIndex < voices.length) {
      this.preferredVoice = voices[voiceIndex];
    }
  }

  // Natural language intent for multiple intents
  extractMultipleIntents(text) {
    const intents = [];
    const navigationIntent = this.detectNavigationIntent(text);

    if (navigationIntent) {
      intents.push({ type: 'navigation', value: navigationIntent });
    }

    if (text.toLowerCase().includes('email') || text.toLowerCase().includes('send')) {
      intents.push({ type: 'action', value: 'email' });
    }

    if (text.toLowerCase().includes('thank') || text.toLowerCase().includes('thanks')) {
      intents.push({ type: 'sentiment', value: 'positive' });
    }

    return intents;
  }
}

export default new VoiceAgentService();
