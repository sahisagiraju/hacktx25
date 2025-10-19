import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const StrategyValidation = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your F1 Strategy Validation AI. I can help you validate race strategies, analyze pit stop windows, and provide tactical recommendations. What would you like to discuss?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const validateStrategy = async (userMessage) => {
    const messageLower = userMessage.toLowerCase();

    // Strategy validation logic
    if (messageLower.includes('pit') || messageLower.includes('stop')) {
      return {
        content: 'Pit Stop Strategy Analysis:\n\n✅ Recommended Window: Laps 18-22\n✅ Current Tire Deg: Moderate\n⚠️ Traffic Risk: Medium\n\n**Validation**: This is an optimal pit window. Tire compound transition will minimize time loss.',
        validation: 'approved'
      };
    } else if (messageLower.includes('undercut') || messageLower.includes('overcut')) {
      return {
        content: 'Undercut/Overcut Analysis:\n\n✅ Track Position: Favorable\n✅ Tire Delta: +2 laps fresher\n⚠️ Out-lap Traffic: Monitor Turn 1\n\n**Validation**: Undercut strategy validated. Execute on lap 19 for maximum advantage.',
        validation: 'approved'
      };
    } else if (messageLower.includes('fuel') || messageLower.includes('save')) {
      return {
        content: 'Fuel Management Strategy:\n\n✅ Current Consumption: 1.8 kg/lap\n⚠️ Projected Shortfall: 2.5 kg\n⛔ Risk Level: High\n\n**Validation**: Fuel saving mode REQUIRED. Recommend lift-and-coast in Turns 8-10.',
        validation: 'warning'
      };
    } else if (messageLower.includes('overtake') || messageLower.includes('pass')) {
      return {
        content: 'Overtaking Strategy:\n\n✅ DRS Available: Main Straight\n✅ Tire Advantage: +3 laps newer\n⚠️ Defending Driver: Experienced\n\n**Validation**: Overtake approved. Target Turn 1 braking zone with DRS advantage.',
        validation: 'approved'
      };
    } else if (messageLower.includes('defend') || messageLower.includes('hold')) {
      return {
        content: 'Defensive Strategy:\n\n✅ Position: Strategically Important\n⚠️ Tire Disadvantage: -4 laps older\n⚠️ Pressure from Behind: High\n\n**Validation**: Defensive driving approved but monitor tire degradation closely.',
        validation: 'warning'
      };
    } else if (messageLower.includes('safety car') || messageLower.includes('yellow')) {
      return {
        content: 'Safety Car Strategy:\n\n✅ Free Pit Stop: Available\n✅ Track Position: Will improve\n✅ Tire Change: Highly Recommended\n\n**Validation**: EXECUTE PIT STOP NOW. This is an optimal opportunity.',
        validation: 'approved'
      };
    } else if (messageLower.includes('tire') || messageLower.includes('tyre')) {
      return {
        content: 'Tire Strategy Analysis:\n\n✅ Current Compound: Performing well\n✅ Degradation Rate: Within targets\n⚠️ Temperature: Slightly elevated\n\n**Validation**: Continue current tire management. No immediate action required.',
        validation: 'approved'
      };
    } else if (messageLower.includes('weather') || messageLower.includes('rain')) {
      return {
        content: 'Weather Strategy:\n\n⚠️ Rain Probability: 40% in 15 minutes\n⚠️ Track Evolution: Unpredictable\n✅ Intermediate Tires: Ready\n\n**Validation**: Stay on current strategy but prepare for weather change. Monitor radar.',
        validation: 'warning'
      };
    } else if (messageLower.includes('fastest lap') || messageLower.includes('bonus point')) {
      return {
        content: 'Fastest Lap Strategy:\n\n✅ Track Conditions: Optimal\n✅ Tire Life: Sufficient for push lap\n⚠️ Gap to Behind: 8.2 seconds\n\n**Validation**: Attempt fastest lap on final lap if gap remains > 5 seconds.',
        validation: 'approved'
      };
    } else {
      return {
        content: 'I can help validate strategies for:\n\n• Pit stop timing and windows\n• Overtaking opportunities\n• Fuel management\n• Tire compound selection\n• Defensive positioning\n• Safety car procedures\n• Weather-related decisions\n\nWhat strategy would you like me to validate?',
        validation: 'neutral'
      };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(async () => {
      const response = await validateStrategy(inputValue);

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response.content,
        validation: response.validation,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getValidationIcon = (validation) => {
    switch (validation) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <XCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getValidationColor = (validation) => {
    switch (validation) {
      case 'approved':
        return 'border-green-400/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-500/10';
      default:
        return 'border-cyan-400/30 bg-cyan-500/10';
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold glow-text-cyan mb-2 header-text">
          STRATEGY VALIDATION
        </h1>
        <p className="text-cyan-400/80 text-sm flex items-center gap-2 terminal-text">
          <Bot className="w-4 h-4 animate-pulse text-cyan-400" />
          AI-powered race strategy validation and tactical analysis
        </p>
      </motion.div>

      {/* Chat Container */}
      <Card className="comet-border flex-1 flex flex-col max-h-[calc(100vh-200px)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            Strategy Validation AI
            <span className="ml-auto text-sm text-gray-400 font-normal">
              Online
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'bot' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : getValidationColor(message.validation)
                    } rounded-lg p-4 border`}
                  >
                    {message.validation && message.type === 'bot' && (
                      <div className="flex items-center gap-2 mb-2">
                        {getValidationIcon(message.validation)}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {message.validation === 'approved' && 'Strategy Approved'}
                          {message.validation === 'warning' && 'Caution Advised'}
                          {message.validation === 'neutral' && 'Information'}
                        </span>
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {message.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about pit stops, tire strategy, fuel management..."
              className="flex-1 bg-gray-800/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors terminal-text"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {['Validate pit strategy', 'Check fuel levels', 'Analyze overtake', 'Safety car procedure'].map(
              (action) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setInputValue(action);
                  }}
                  className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
                >
                  {action}
                </motion.button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyValidation;
