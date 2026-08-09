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
  
    // Load conversation from sessionStorage.
    // Sessions saved by older builds stored the body as `text`; normalize them
    // to `html` so a stale tab doesn't render empty bubbles.
    loadConversationFromSession() {
      try {
        const stored = sessionStorage.getItem(this.sessionKey);
        if (!stored) return [];

        const { messages = [] } = JSON.parse(stored);
        return messages
          .map((msg, i) => ({
            ...msg,
            id: msg.id ?? `restored-${i}`,
            html: msg.html ?? msg.text ?? '',
          }))
          .filter((msg) => msg.html);
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
      // Keep the last 10 exchanges so the prompt stays manageable.
      return messages
        .slice(-20)
        .map((msg) => {
          const body = msg.html ?? msg.text ?? '';
          return msg.isBot
            ? `Assistant: ${body.replace(/<[^>]*>/g, '')}`  // strip our own HTML
            : `User: ${body}`;
        })
        .join('\n');
    }
  
    async sendMessage(message, conversationHistory = '', voiceMode = false) {
      try {
        const response = await fetch(this.baseURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.trim(),
            conversation_history: conversationHistory,
            session_id: this.getOrCreateSessionId(),
            voice_mode: voiceMode  // Flag for voice agent mode
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
  