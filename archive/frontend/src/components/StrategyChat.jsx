import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader, Search } from 'lucide-react';

function ChatMessage({ message, isBot, timestamp }) {
  return (
    <motion.div
      className={`chat-message ${isBot ? 'bot' : 'user'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-avatar">
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>

      <div className="message-content">
        <div className="message-text">{message}</div>
        <div className="message-time">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}

function StrategyChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      message: "Hello! I'm your AstraGuard strategy assistant. Ask me about race strategy, rival analysis, or historical decisions.",
      isBot: true,
      timestamp: Date.now() - 60000
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock responses for demo
  const mockResponses = [
    "Based on historical data from the 2023 season, defending the inside line at Turn 12 against RBR_1 has a 74% success rate when ERS is deployed in Sector 3.",
    "The current weather forecast shows a 30% chance of rain in the next 15 minutes. I'd recommend switching to intermediate tires if you see dark clouds approaching.",
    "Rival MCL_3 shows a pattern of aggressive moves when their ERS is above 60%. Consider defensive positioning if their battery level is high.",
    "Your current lap time of 1:23.456 is 0.8 seconds faster than your previous best. The key differentiator appears to be your exit speed from Turn 8.",
    "Historical analysis shows that Ferrari drivers tend to be most aggressive during laps 15-25 of a stint. Stay vigilant for potential moves."
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      message: inputValue,
      isBot: false,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        message: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        isBot: true,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="strategy-chat-container">
      <div className="panel-header">
        <h3>Strategy Assistant</h3>
        <div className="chat-status">
          <div className="status-dot connected"></div>
          <span>RAG Connected</span>
        </div>
      </div>

      <div className="chat-messages">
        <AnimatePresence>
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message.message}
              isBot={message.isBot}
              timestamp={message.timestamp}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className="chat-message bot loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="loading-indicator">
                <Loader size={16} className="spinning" />
                <span>Analyzing strategy data...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder="Ask about strategy, rivals, or historical data..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            disabled={isLoading}
          />
          <motion.button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={20} />
          </motion.button>
        </div>

        <div className="quick-questions">
          <span className="quick-questions-label">Quick questions:</span>
          {[
            "Why defend this turn?",
            "Best tire strategy?",
            "Rival attack patterns?",
            "Weather impact?"
          ].map((question, index) => (
            <motion.button
              key={index}
              className="quick-question-btn"
              onClick={() => setInputValue(question)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {question}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StrategyChat;
