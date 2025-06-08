import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      text: "Hi I am Naisarg's AI Buddy! You can ask me anything about him and I'd be happy to help you out!", 
      isBot: true, 
      timestamp: new Date() 
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() === '') return;

    const userMessage = {
      text: userInput,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    // Placeholder for your API call
    setTimeout(() => {
      const botMessage = {
        text: "Thanks for your message! This will connect to the backend soon.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`chatbot-sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* VS Code Window Header */}
      <div className="chatbot-header">
        <div className="header-left">
          <div className="file-info">
            <span className="file-icon">💬</span>
            <span className="file-name">ai-buddy.js</span>
            <span className="file-status">●</span>
          </div>
        </div>
        <div className="header-right">
          <button className="close-button" onClick={onClose}>×</button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="chatbot-tabs">
        <div className="tab active">
          <span className="tab-icon">💬</span>
          <span className="tab-name">Naisarg's AI Assistant</span>
        </div>
      </div>

      {/* Code Editor Style Messages */}
      <div className="chatbot-editor">
        <div className="line-numbers">
          {messages.map((_, index) => (
            <div key={index} className="line-number">{index + 1}</div>
          ))}
          {isLoading && <div className="line-number">{messages.length + 1}</div>}
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message-line ${message.isBot ? 'bot-message' : 'user-message'}`}>
              <div className="message-code">
                <span className="message-syntax">
                  {message.isBot ? 'assistant' : 'user'}.say(
                </span>
                <span className="message-content">"{message.text}"</span>
                <span className="message-syntax">);</span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-line bot-message">
              <div className="message-code">
                <span className="message-syntax">assistant.thinking(</span>
                <span className="typing-dots">
                  <span></span><span></span><span></span>
                </span>
                <span className="message-syntax">);</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chatbot-input-area">
        <div className="input-line-number">{messages.length + (isLoading ? 2 : 1)}</div>
        <div className="input-container">
          <span className="input-syntax">user.ask(</span>
          <textarea
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="your message here..."
            disabled={isLoading}
            className="message-input"
            rows="1"
          />
          <span className="input-syntax">);</span>
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || userInput.trim() === ''}
            className="send-button"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="chatbot-status-bar">
        <div className="status-left">
          <span className="status-item">
            <span className="status-icon">🟢</span>
            Connected
          </span>
          <span className="status-item">Messages: {messages.length}</span>
        </div>
        <div className="status-right">
          <span className="status-item">JavaScript</span>
          <span className="status-item">UTF-8</span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
