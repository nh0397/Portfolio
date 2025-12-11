import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import chatbotLogo from "../assets/logos/Chatbot-front.jpg";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";

const Chatbot = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // State for managing loader
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Set up the initial message
    setMessages([
      {
        text: "Welcome to Naisarg's AI buddy! How can I help you today?",
        isBot: true,
      },
    ]);
  }, []);

  // Reset messages on page refresh or session close
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("nhBuddyMessages");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("nhBuddyMessages", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, isBot: false },
    ]);

    // Clear the input box and show the loader
    setInput("");
    setLoading(true);

    const apiUrl = process.env.REACT_APP_CHATBOT_API_URL;
    console.log("API URL IS ", apiUrl);

    try {
      // Send message to the backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      // Check if the response is not ok (status not in the range 200-299)
      if (!response.ok) {
        throw new Error("Failed to fetch response from the server.");
      }

      const data = await response.json();

      // Add the HTML-formatted LLM response to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.response, isBot: true },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add an error message to the chat for the user
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Failed to send the message. Please try again.", isBot: true },
      ]);
    } finally {
      // Hide the loader whether it succeeds or fails
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClickOutside = (e) => {
    if (e.target.className === "chatbot expanded") {
      handleToggle();
    }
  };

  return (
    <div
      className={`chatbot ${isExpanded ? "expanded" : ""}`}
      onClick={handleClickOutside}
      role="dialog"
      aria-label="AI Chatbot"
      aria-modal={isExpanded}
    >
      {!isExpanded && (
        <button 
          className="chatbot-collapsed" 
          onClick={handleToggle}
          aria-label="Open AI chatbot"
          aria-expanded="false"
        >
          <img src={chatbotLogo} alt="Chatbot Logo" className="chatbot-logo" />
        </button>
      )}
      {isExpanded && (
        <div className="chatbot-content" onClick={(e) => e.stopPropagation()}>
          <div className="chatbot-header">
            <div className="chatbot-header-logo">
              <img
                src={chatbotLogo}
                alt="NH's AI Buddy chatbot"
                className="chatbot-header-logo-img"
              />
            </div>
            <h2 className="chatbot-header-title">NH's Buddy</h2>
            <button 
              className="chatbot-close-button" 
              onClick={handleToggle}
              aria-label="Close chatbot"
            >
              <span aria-hidden="true">X</span>
            </button>
          </div>
          <div 
            className="chatbot-body"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Chat messages"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.isBot ? "bot-message" : "user-message"
                }`}
                role="listitem"
              >
                {message.isBot ? (
                  <>
                    <Avatar className="message-logo" src={chatbotLogo} alt="AI Assistant" />
                    <div
                      className="message-text"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                      role="article"
                    />
                  </>
                ) : (
                  <>
                    <div className="message-text" role="article">{message.text}</div>
                    <Avatar className="message-logo" aria-label="User">
                      <PersonIcon />
                    </Avatar>
                  </>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot-message" role="status" aria-live="polite">
                <Avatar className="message-logo" src={chatbotLogo} alt="AI Assistant" />
                <div className="message-text">Thinking...</div>
              </div>
            )}
            <div ref={messageEndRef} aria-hidden="true" />
          </div>
          <div className="chatbot-footer">
            <label htmlFor="chatbot-input" className="sr-only">Type your message</label>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="chatbot-input"
              disabled={loading}
              aria-label="Chat message input"
              aria-describedby="chatbot-status"
            />
            <span id="chatbot-status" className="sr-only">
              {loading ? "Sending message" : "Ready to send"}
            </span>
            <button
              onClick={handleSendMessage}
              className="chatbot-send-button"
              disabled={loading}
              aria-label={loading ? "Sending message" : "Send message"}
            >
              {loading ? "Loading..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
