import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Radio, Mic, X, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const RadioComms = () => {
  const { radioData, isConnected } = useWebSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [radioData]);

  const handleDemoClick = () => {
    setIsModalOpen(true);
    setTranscript('');
    setAiResponse('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsListening(false);
    setTranscript('');
    setAiResponse('');
  };

  const startListening = async () => {
    setIsListening(true);
    setTranscript('');
    setAiResponse('');
    setIsProcessing(true);

    try {
      // Check if browser supports Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        setIsListening(false);
        setIsProcessing(false);
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        setIsListening(false);

        // Call Gemini API for response
        try {
          const response = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: speechToText })
          });

          if (response.ok) {
            const data = await response.json();
            setAiResponse(data.response);

            // Use ElevenLabs to speak the response (if available)
            speakResponse(data.response);
          } else {
            setAiResponse('Sorry, I encountered an error processing your request.');
          }
        } catch (error) {
          console.error('Error calling Gemini API:', error);
          setAiResponse('Sorry, I could not connect to the AI service.');
        }

        setIsProcessing(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        setTranscript('Error: Could not recognize speech. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  const speakResponse = (text) => {
    // Use browser's speech synthesis as fallback
    // In production, this would call ElevenLabs API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold glow-text-cyan mb-2 header-text">
            RADIO COMMUNICATIONS
          </h1>
          <p className="text-cyan-400/80 text-sm flex items-center gap-2 terminal-text">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            Live team radio transcriptions • {radioData.length} messages
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}></div>
            <span className="text-sm terminal-text">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Radio Messages - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <Card className="comet-border h-[calc(100vh-250px)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                Live Radio Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-4">
                  {radioData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Radio className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No radio messages yet...</p>
                      <p className="text-sm mt-2">Listening for team communications</p>
                    </div>
                  ) : (
                    radioData.map((message, index) => (
                      <div
                        key={`${message.ts}-${index}`}
                        className="radio-transcript space-card p-4 rounded-lg border border-cyan-400/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-cyan-400" />
                            <span className="font-bold text-cyan-400 terminal-text">
                              {message.team || 'Unknown Team'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 terminal-text">
                            {formatTimestamp(message.ts)}
                          </span>
                        </div>
                        <p className="text-white text-sm leading-relaxed pl-6">
                          {message.text}
                        </p>
                        {message.driver_id && (
                          <div className="mt-2 pl-6">
                            <span className="text-xs text-gray-500 terminal-text">
                              Driver: {message.driver_id}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Command Column */}
        <div className="lg:col-span-1">
          <Card className="comet-border h-[calc(100vh-250px)] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                Voice Command
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isListening
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-500'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800'
                }`}
              >
                <Mic className="w-12 h-12 text-white" />
              </div>

              <button
                onClick={handleDemoClick}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <Mic className="w-5 h-5" />
                  ACTIVATE
                </div>
              </button>

              <div className="text-center text-sm text-gray-400 space-y-1">
                <p>AI Voice Assistant</p>
                <p className="text-xs">Powered by Gemini AI</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcribed Strategies Column */}
        <div className="lg:col-span-1">
          <Card className="comet-border h-[calc(100vh-250px)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
                Strategy Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-3">
                {radioData.slice(0, 10).map((message, index) => {
                  // Extract potential strategy keywords
                  const text = message.text.toLowerCase();
                  const hasStrategy =
                    text.includes('push') ||
                    text.includes('box') ||
                    text.includes('save') ||
                    text.includes('plan') ||
                    text.includes('defend');

                  if (!hasStrategy) return null;

                  return (
                    <div
                      key={`${message.ts}-${index}`}
                      className="space-card p-3 rounded-lg border border-yellow-400/30 bg-yellow-500/5"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded uppercase">
                          {message.team}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formatTimestamp(message.ts)}
                        </span>
                      </div>
                      <p className="text-white text-xs leading-relaxed">
                        {message.text}
                      </p>
                    </div>
                  );
                })}

                {radioData.filter(m => {
                  const text = m.text.toLowerCase();
                  return text.includes('push') || text.includes('box') ||
                         text.includes('save') || text.includes('plan') ||
                         text.includes('defend');
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No strategy signals detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice Demo Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-cyan-400/50 rounded-xl p-8 max-w-2xl w-full space-y-6 comet-border shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold glow-text-cyan header-text">
                  AI VOICE ASSISTANT
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Microphone Visual */}
              <div className="flex flex-col items-center space-y-6">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center ${
                    isListening
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-500'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800'
                  }`}
                >
                  <Mic className="w-16 h-16 text-white" />
                </div>

                {!isListening && !isProcessing && !transcript && (
                  <button
                    onClick={startListening}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white shadow-lg"
                  >
                    Start Speaking
                  </button>
                )}

                {isListening && (
                  <p className="text-cyan-400 text-lg font-medium terminal-text">
                    Listening...
                  </p>
                )}

                {isProcessing && !isListening && (
                  <p className="text-purple-400 text-lg font-medium terminal-text">
                    Processing...
                  </p>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="space-y-4">
                  <div className="space-card p-4 rounded-lg border border-cyan-400/30">
                    <p className="text-sm text-gray-400 mb-2">You said:</p>
                    <p className="text-white">{transcript}</p>
                  </div>

                  {aiResponse && (
                    <div className="space-card p-4 rounded-lg border border-purple-400/30">
                      <p className="text-sm text-gray-400 mb-2">AI Response:</p>
                      <p className="text-white">{aiResponse}</p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setTranscript('');
                      setAiResponse('');
                      startListening();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-white"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="text-center text-sm text-gray-400 space-y-2">
                <p>Click the button and speak your question or command</p>
                <p className="text-xs">Powered by ElevenLabs & Gemini AI</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default RadioComms;
