import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import ChatbotService from '../../../services/ChatbotService';
import VoiceAgentService from '../../../services/VoiceAgentService';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported] = useState(VoiceAgentService.isSupported());
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    VoiceAgentService.onListeningStateChange = (listening) => {
      setIsListening(listening);
    };

    VoiceAgentService.onTranscriptChange = (transcript) => {
      setUserInput(transcript);
    };

    VoiceAgentService.onError = (error) => {
      console.error('Voice error:', error);
    };
  }, []);

  useEffect(() => {
    const savedMessages = ChatbotService.loadConversationFromSession();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      setMessages([
        {
          id: 1,
          text: "Hey! 👋 I'm Naisarg's AI assistant. Ask me about his projects, experience, skills, or anything else!",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      ChatbotService.saveConversationToSession(messages);
    }
  }, [messages]);

  const handleSendMessage = async (message = userInput, isVoice = false) => {
    if (message.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      isVoice,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const conversationHistory = ChatbotService.formatConversationHistory(
        [...messages, newMessage]
      );
      const navigationIntent = VoiceAgentService.detectNavigationIntent(message);

      const response = await ChatbotService.sendMessage(message, conversationHistory, isVoice);

      const botMessage = {
        id: messages.length + 2,
        text: response.response,
        isBot: true,
        timestamp: new Date(),
        navigationIntent,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (navigationIntent) {
        setTimeout(() => {
          scrollToSection(navigationIntent);
        }, 300);
      }

      if (isVoice && voiceSupported) {
        setIsSpeaking(true);
        VoiceAgentService.speak(response.response);
        setTimeout(() => {
          setIsSpeaking(VoiceAgentService.getIsSpeaking());
        }, 500);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Error: ${error.message}`,
          isBot: true,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      VoiceAgentService.stopListening();
      if (userInput.trim()) {
        handleSendMessage(userInput, true);
      }
    } else {
      VoiceAgentService.startListening();
    }
  };

  const toggleHandsFreeMode = () => {
    if (!handsFreeMode) {
      setHandsFreeMode(true);
      VoiceAgentService.startListening();
      VoiceAgentService.speak("Hands-free mode activated. I'm listening!");
    } else {
      setHandsFreeMode(false);
      VoiceAgentService.stopListening();
      VoiceAgentService.stopSpeaking();
    }
  };

  const scrollToSection = (section) => {
    // This would need to emit an event to the parent component
    window.dispatchEvent(new CustomEvent('navigateToSection', { detail: { section } }));
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Chat cleared! Ready for a fresh conversation 🎉",
        isBot: true,
        timestamp: new Date(),
      },
    ]);
    ChatbotService.clearConversationSession();
  };

  return (
    <div className={`modern-chatbot ${isOpen ? 'open' : 'closed'}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-content">
          <h3>AI Assistant</h3>
          <p className="status-text">
            {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '✨ Ready'}
          </p>
        </div>
        <div className="header-controls">
          <button
            className={`voice-toggle ${handsFreeMode ? 'active' : ''}`}
            onClick={toggleHandsFreeMode}
            title="Toggle hands-free mode"
            aria-label="Toggle hands-free mode"
          >
            🎙️
          </button>
          <button
            className="clear-btn"
            onClick={clearChat}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            🗑️
          </button>
          <button
            className="close-btn"
            onClick={onClose}
            title="Close chatbot"
            aria-label="Close chatbot"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="message-avatar">
              {msg.isBot ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
              {msg.isVoice && <span className="voice-indicator">🎤 Voice</span>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chatbot-input-area">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message or use voice..."
          className="message-input"
          disabled={isLoading}
        />

        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          disabled={!voiceSupported || isLoading}
          title="Toggle voice input"
          aria-label="Toggle voice input"
        >
          🎙️
        </button>

        <button
          className="send-btn"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !userInput.trim()}
          title="Send message"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>

      {/* Footer */}
      <div className="chatbot-footer">
        <p className="footer-text">💡 Tip: Say "show me projects" or "tell me about experience"</p>
      </div>
    </div>
  );
};

export default Chatbot;
