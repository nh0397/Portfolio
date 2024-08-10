import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import chatbotLogo from '../assets/logos/Chatbot-front.jpg';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

const Chatbot = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Set up the initial message
    setMessages(["Welcome to Naisarg's AI buddy! How can I help you today?"]);
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
  }, [messages]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    setMessages((prevMessages) => [...prevMessages, input]);
    setInput('');
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
                className={`message ${index % 2 === 0 ? 'bot-message' : 'user-message'}`}
              >
                {index % 2 === 0 ? (
                  <>
                    <Avatar className="message-logo" src={chatbotLogo} />
                    <p className="message-text">{message}</p>
                  </>
                ) : (
                  <>
                    <p className="message-text">{message}</p>
                    <Avatar className="message-logo">
                      <PersonIcon />
                    </Avatar>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="chatbot-footer">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="chatbot-input"
            />
            <button onClick={handleSendMessage} className="chatbot-send-button">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
