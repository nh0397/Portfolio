// ChatbotService.js
class ChatbotService {
    constructor() {
      this.baseURL = process.env.REACT_APP_CHATBOT_API_URL;
      this.sessionKey = 'naisarg_chatbot_conversation';
    }
  
    // Save conversation to sessionStorage
    saveConversationToSession(messages) {
      try {
        const conversationData = {
          messages: messages,
          timestamp: new Date().toISOString(),
          sessionId: this.getOrCreateSessionId()
        };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(conversationData));
      } catch (error) {
        console.warn('Failed to save conversation to sessionStorage:', error);
      }
    }
  
    // Load conversation from sessionStorage
    loadConversationFromSession() {
      try {
        const stored = sessionStorage.getItem(this.sessionKey);
        if (stored) {
          const conversationData = JSON.parse(stored);
          return conversationData.messages || [];
        }
        return [];
      } catch (error) {
        console.warn('Failed to load conversation from sessionStorage:', error);
        return [];
      }
    }
  
    // Get or create session ID
    getOrCreateSessionId() {
      let sessionId = sessionStorage.getItem('chatbot_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('chatbot_session_id', sessionId);
      }
      return sessionId;
    }
  
    // Clear conversation when needed
    clearConversationSession() {
      sessionStorage.removeItem(this.sessionKey);
      sessionStorage.removeItem('chatbot_session_id');
    }
  
    // Format conversation history for backend context
    formatConversationHistory(messages) {
      // Get last 10 exchanges to keep context manageable
      const recentMessages = messages.slice(-20);
      
      const conversationHistory = recentMessages.map(msg => {
        if (msg.isBot) {
          return `Assistant: ${msg.text.replace(/<[^>]*>/g, '')}`;  // Strip HTML tags
        } else {
          return `User: ${msg.text}`;
        }
      }).join('\n');
  
      return conversationHistory;
    }
  
    async sendMessage(message, conversationHistory = '') {
      try {
        const response = await fetch(this.baseURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: message.trim(),
            conversation_history: conversationHistory,
            session_id: this.getOrCreateSessionId()
          })
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch response from the server.");
        }
  
        return await response.json();
      } catch (error) {
        console.error('ChatbotService: Error sending message:', error);
        throw error;
      }
    }
  }
  
  export default new ChatbotService();
  