import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Mic, MicOff, Volume2, Radio } from 'lucide-react';

const VoiceIndicator = () => {
  const { radioData, isConnected } = useWebSocket();
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recentActivity, setRecentActivity] = useState(false);

  useEffect(() => {
    // Simulate audio level changes
    const interval = setInterval(() => {
      if (isListening) {
        setAudioLevel(Math.random() * 100);
      } else {
        setAudioLevel(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    // Show activity indicator when new radio data arrives
    if (radioData.length > 0) {
      setRecentActivity(true);
      const timer = setTimeout(() => setRecentActivity(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [radioData]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const getAudioLevelColor = (level) => {
    if (level < 30) return 'bg-f1-green';
    if (level < 60) return 'bg-f1-yellow';
    if (level < 80) return 'bg-f1-orange';
    return 'bg-f1-red';
  };

  const getAudioLevelHeight = (level) => {
    return Math.max(2, (level / 100) * 20);
  };

  return (
    <div className="galaxy-card p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Radio className="w-5 h-5 mr-2" />
          Voice Control
        </h3>
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-f1-green animate-pulse' : 'bg-f1-red'
        }`}></div>
      </div>

      {/* Audio Level Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Audio Level</span>
          <span className="text-sm text-white">{audioLevel.toFixed(0)}%</span>
        </div>
        <div className="flex items-end space-x-1 h-6">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={`w-2 rounded-sm transition-all duration-100 ${
                i < (audioLevel / 5) ? getAudioLevelColor(audioLevel) : 'bg-black/80 border border-purple-500/10'
              }`}
              style={{ height: getAudioLevelHeight(audioLevel) }}
            ></div>
          ))}
        </div>
      </div>

      {/* Voice Controls */}
      <div className="space-y-3">
        <button
          onClick={toggleListening}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-all duration-200 ${
            isListening
              ? 'bg-f1-red hover:bg-f1-red/80 text-white'
              : 'bg-f1-blue hover:bg-f1-blue/80 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Listening</span>
            </>
          )}
        </button>

        {/* Activity Indicator */}
        {recentActivity && (
          <div className="flex items-center space-x-2 text-sm text-f1-green animate-pulse">
            <Volume2 className="w-4 h-4" />
            <span>Recent radio activity detected</span>
          </div>
        )}

        {/* Status */}
        <div className="text-xs text-gray-400 text-center">
          {isListening ? 'Listening for voice commands...' : 'Voice control ready'}
        </div>
      </div>

      {/* Recent Radio Messages */}
      <div className="mt-4 pt-4 border-t border-galaxy-glow/30">
        <h4 className="text-sm font-medium text-white mb-2">Recent Activity</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {radioData.slice(0, 3).map((message, index) => (
            <div key={index} className="text-xs text-gray-300 bg-black/95 border border-purple-500/20 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{message.team}</span>
                <span className="text-gray-400">
                  {new Date(message.ts).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-gray-400">{message.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceIndicator;
