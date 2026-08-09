// VoiceAgentService.js
// Handles speech-to-text, intent detection, and text-to-speech

class VoiceAgentService {
  constructor() {
    this.isListening = false;
    this.transcript = '';
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.onTranscriptChange = null;
    this.onListeningStateChange = null;
    this.onError = null;

    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      this.recognition = null;
    } else {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    // Initialize Speech Synthesis
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
    };

    this.recognition.onresult = (event) => {
      this.transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        this.transcript += event.results[i][0].transcript;
      }
      if (this.onTranscriptChange) this.onTranscriptChange(this.transcript);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onListeningStateChange) this.onListeningStateChange(false);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) this.onError(event.error);
      this.isListening = false;
      if (this.onListeningStateChange) this.onListeningStateChange(false);
    };
  }

  // Start listening
  startListening() {
    if (!this.recognition) {
      if (this.onError) this.onError('Web Speech API not supported');
      return;
    }
    this.recognition.start();
  }

  // Stop listening
  stopListening() {
    if (!this.recognition) return;
    this.recognition.stop();
  }

  // Get final transcript
  getFinalTranscript() {
    return this.transcript;
  }

  // Detect navigation intent from text
  detectNavigationIntent(text) {
    const lowerText = text.toLowerCase();

    const navigationMap = {
      projects: ['show me your projects', 'projects', 'what projects', 'your projects', 'built'],
      skills: ['show me your skills', 'skills', 'what skills', 'technologies', 'tech stack', 'languages'],
      experience: ['work experience', 'experience', 'worked at', 'where did you work', 'jobs', 'employment'],
      contact: ['contact', 'email', 'reach out', 'get in touch', 'how to contact', 'how can i reach you'],
      about: ['about you', 'tell me about', 'who are you', 'introduce yourself', 'summary'],
    };

    for (const [section, keywords] of Object.entries(navigationMap)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return section;
      }
    }

    return null; // No navigation intent, just answer the question
  }

  // Speak text aloud
  speak(text) {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    // Strip HTML tags from text
    const plainText = text.replace(/<[^>]*>/g, '');

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isSpeaking = false;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // Check if supported
  isSupported() {
    return !!this.recognition && !!this.synth;
  }

  // Check if currently speaking
  getIsSpeaking() {
    return this.isSpeaking;
  }

  // Check if currently listening
  getIsListening() {
    return this.isListening;
  }
}

export default new VoiceAgentService();
