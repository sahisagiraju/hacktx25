import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Send, Radio, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';

const StrategyChat = () => {
  const { radioData, anomalies, summaries } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Process radio messages into chat format
    const newMessages = radioData.map((radio, index) => ({
      id: `radio-${index}`,
      type: 'radio',
      sender: radio.team,
      message: radio.text,
      timestamp: radio.ts,
      driver: radio.driver_id
    }));

    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const newUniqueMessages = newMessages.filter(m => !existingIds.has(m.id));
      return [...newUniqueMessages, ...prev].slice(0, 100); // Keep last 100 messages
    });
  }, [radioData]);

  useEffect(() => {
    // Process anomalies into chat format
    Object.values(anomalies).forEach((anomaly, index) => {
      if (anomaly.is_anomaly) {
        const message = {
          id: `anomaly-${anomaly.driver_id}-${index}`,
          type: 'anomaly',
          sender: 'AI System',
          message: `Anomaly detected in ${anomaly.top_anomaly?.feature}: ${anomaly.top_anomaly?.value} (Score: ${anomaly.top_anomaly?.score?.toFixed(1)})`,
          timestamp: anomaly.timestamp,
          driver: anomaly.driver_id,
          severity: anomaly.confidence > 0.8 ? 'high' : 'medium'
        };

        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          if (!exists) {
            return [message, ...prev].slice(0, 100);
          }
          return prev;
        });
      }
    });
  }, [anomalies]);

  useEffect(() => {
    // Process AI summaries into chat format
    Object.values(summaries).forEach((summary, index) => {
      const message = {
        id: `summary-${summary.driver_id}-${index}`,
        type: 'summary',
        sender: 'AI Analyst',
        message: summary.summary,
        timestamp: summary.timestamp,
        driver: summary.driver_id,
        confidence: summary.confidence
      };

      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (!exists) {
          return [message, ...prev].slice(0, 100);
        }
        return prev;
      });
    });
  }, [summaries]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      sender: 'Race Engineer',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [userMessage, ...prev]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        sender: 'AI Assistant',
        message: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [aiResponse, ...prev]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage) => {
    const responses = [
      "Analyzing telemetry data and radio communications...",
      "Based on current performance metrics, I recommend adjusting the strategy.",
      "Anomaly detection algorithms are monitoring all drivers for unusual patterns.",
      "Radio communication analysis shows potential codeword patterns emerging.",
      "Driver performance is within expected parameters for this track section.",
      "Fuel management strategy appears optimal based on current lap times.",
      "Weather conditions may require strategy adjustments in upcoming laps.",
      "Pit window analysis suggests optimal timing for pit stops."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'radio': return <Radio className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'summary': return <TrendingUp className="w-4 h-4" />;
      case 'user': return <MessageSquare className="w-4 h-4" />;
      case 'ai': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'radio': return 'text-f1-yellow';
      case 'anomaly': return 'text-f1-red';
      case 'summary': return 'text-f1-blue';
      case 'user': return 'text-f1-green';
      case 'ai': return 'text-f1-purple';
      default: return 'text-gray-400';
    }
  };

  const getMessageBg = (type) => {
    switch (type) {
      case 'radio': return 'bg-f1-yellow/10 border-f1-yellow/30';
      case 'anomaly': return 'bg-f1-red/10 border-f1-red/30';
      case 'summary': return 'bg-f1-blue/10 border-f1-blue/30';
      case 'user': return 'bg-f1-green/10 border-f1-green/30';
      case 'ai': return 'bg-f1-purple/10 border-f1-purple/30';
      default: return 'bg-gray-700/10 border-gray-700/30';
    }
  };

  return (
    <div className="galaxy-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Strategy Communications
        </h2>
        <div className="text-sm text-gray-400">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto space-y-3 mb-6 pr-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No communications yet</p>
            <p className="text-sm">Radio messages and AI analysis will appear here</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${getMessageBg(message.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 ${getMessageColor(message.type)}`}>
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {message.driver && (
                    <div className="text-xs text-gray-400 mb-2">
                      Driver: {message.driver}
                    </div>
                  )}
                  <p className="text-sm text-gray-300">{message.message}</p>
                  {message.severity && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        message.severity === 'high' 
                          ? 'bg-f1-red/20 text-f1-red' 
                          : 'bg-f1-yellow/20 text-f1-yellow'
                      }`}>
                        {message.severity.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  )}
                  {message.confidence && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">
                        Confidence: {(message.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="p-4 rounded-lg border bg-f1-purple/10 border-f1-purple/30">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-f1-purple rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-f1-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-f1-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-sm text-gray-400 ml-2">AI is typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex space-x-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your strategy message..."
          className="flex-1 bg-galaxy-blue/50 border border-galaxy-glow/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-f1-blue focus:ring-1 focus:ring-f1-blue"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="px-4 py-2 bg-f1-blue text-white rounded-lg hover:bg-f1-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default StrategyChat;
