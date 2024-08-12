import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import chatbotLogo from '../assets/logos/Chatbot-front.jpg';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

const Chatbot = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // State for managing loader
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Set up the initial message
    setMessages([{ text: "Welcome to Naisarg's AI buddy! How can I help you today?", isBot: true }]);
  }, []);

  // Reset messages on page refresh or session close
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('nhBuddyMessages');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('nhBuddyMessages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Add user message to the chat
    setMessages((prevMessages) => [...prevMessages, { text: input, isBot: false }]);

    // Clear the input box and show the loader
    setInput('');
    setLoading(true);

    // Send message to the backend
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();

    // Add the HTML-formatted LLM response to the chat
    setMessages((prevMessages) => [...prevMessages, { text: data.response, isBot: true }]);
    setLoading(false); // Hide the loader
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.className === 'chatbot expanded') {
      handleToggle();
    }
  };

  return (
    <div className={`chatbot ${isExpanded ? 'expanded' : ''}`} onClick={handleClickOutside}>
      {!isExpanded && (
        <div className="chatbot-collapsed" onClick={handleToggle}>
          <img src={chatbotLogo} alt="Chatbot Logo" className="chatbot-logo" />
        </div>
      )}
      {isExpanded && (
        <div className="chatbot-content" onClick={(e) => e.stopPropagation()}>
          <div className="chatbot-header">
            <div className="chatbot-header-logo">
              <img src={chatbotLogo} alt="chatbot" className="chatbot-header-logo-img" />
            </div>
            <div className="chatbot-header-title">NH's Buddy</div>
            <button className="chatbot-close-button" onClick={handleToggle}>X</button>
          </div>
          <div className="chatbot-body">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
              >
                {message.isBot ? (
                  <>
                    <Avatar className="message-logo" src={chatbotLogo} />
                    <div className="message-text" dangerouslySetInnerHTML={{ __html: message.text }} />
                  </>
                ) : (
                  <>
                    <div className="message-text">{message.text}</div>
                    <Avatar className="message-logo">
                      <PersonIcon />
                    </Avatar>
                  </>
                )}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="chatbot-footer">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="chatbot-input"
              disabled={loading} // Disable input while loading
            />
            <button onClick={handleSendMessage} className="chatbot-send-button" disabled={loading}>
              {loading ? 'Loading...' : 'Send'} {/* Show loader text or Send button */}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
