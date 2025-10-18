import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, VolumeX, Radio } from 'lucide-react';

function VoiceIndicator() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [lastCommand, setLastCommand] = useState('');

  // Simulate voice activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (isListening) {
        setVoiceLevel(Math.random() * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  // Simulate voice commands
  useEffect(() => {
    if (isSpeaking) {
      const commands = [
        "Defend inside at Turn 12",
        "ERS deployment in Sector 3",
        "Watch RBR_1 closing rate",
        "Tire temperatures optimal"
      ];

      const timer = setTimeout(() => {
        setLastCommand(commands[Math.floor(Math.random() * commands.length)]);
        setIsSpeaking(false);
      }, 2000 + Math.random() * 1000);

      return () => clearTimeout(timer);
    }
  }, [isSpeaking]);

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setVoiceLevel(0);
      setLastCommand('');
    }
  };

  return (
    <div className="voice-indicator-container">
      <motion.button
        className={`voice-toggle ${isListening ? 'listening' : ''}`}
        onClick={handleVoiceToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
      >
        <Mic size={20} />
        {isListening && (
          <motion.div
            className="listening-indicator"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      <div className="voice-status">
        <div className="voice-level">
          {isListening && (
            <motion.div
              className="level-bars"
              initial={{ height: 0 }}
              animate={{ height: `${voiceLevel}%` }}
              transition={{ duration: 0.1 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="level-bar"
                  animate={{
                    backgroundColor: voiceLevel > (i + 1) * 20 ?
                      ['#44ff44', '#ffaa00', '#ff4444'][Math.floor(voiceLevel / 40)] : '#333'
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        <div className="voice-label">
          {isListening ? 'Listening...' : 'Voice Off'}
        </div>
      </div>

      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="speaking-indicator"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
          >
            <Volume2 size={16} className="speaking-icon" />
            <span>Speaking</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastCommand && (
          <motion.div
            className="last-command"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Radio size={14} />
            <span>"{lastCommand}"</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="voice-settings">
        <motion.button
          className="settings-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Voice Settings"
        >
          ⚙️
        </motion.button>
      </div>
    </div>
  );
}

export default VoiceIndicator;
