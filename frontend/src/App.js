import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import components (we'll create these next)
import CelestialMap from './components/CelestialMap';
import ThreatRibbon from './components/ThreatRibbon';
import StrategyChat from './components/StrategyChat';
import TelemetryPanel from './components/TelemetryPanel';
import VoiceIndicator from './components/VoiceIndicator';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentLap, setCurrentLap] = useState(1);
  const [latency, setLatency] = useState(127);
  const [alerts, setAlerts] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mock WebSocket connection for demo
  useEffect(() => {
    // Simulate connection
    setIsConnected(true);

    // Mock data updates
    const interval = setInterval(() => {
      setCurrentLap(prev => prev + 1);
      setLatency(prev => Math.max(50, prev + Math.random() * 20 - 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    toast.success(voiceEnabled ? 'Voice disabled' : 'Voice enabled');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast.success(soundEnabled ? 'Sound disabled' : 'Sound enabled');
  };

  return (
    <div className="astraguard-container">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />

      {/* 3D Celestial Background */}
      <div className="celestial-background">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* Main UI Overlay */}
      <div className="ui-overlay">
        {/* Header */}
        <header className="astraguard-header">
          <div className="logo-section">
            <motion.h1
              className="astraguard-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              ASTRA<span className="guard-text">GUARD</span>
            </motion.h1>
            <motion.p
              className="tagline"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Read the stars. Guard the apex.
            </motion.p>
          </div>

          <div className="controls-section">
            <motion.button
              className={`control-btn ${voiceEnabled ? 'active' : ''}`}
              onClick={toggleVoice}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {voiceEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </motion.button>
            <motion.button
              className={`control-btn ${soundEnabled ? 'active' : ''}`}
              onClick={toggleSound}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>
            <VoiceIndicator />
          </div>
        </header>

        {/* Main Dashboard */}
        <div className="dashboard-grid">
          {/* Left Panel - Celestial Map */}
          <motion.div
            className="celestial-panel"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CelestialMap alerts={alerts} />
          </motion.div>

          {/* Center Panel - Threat Analysis */}
          <motion.div
            className="threat-panel"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ThreatRibbon alerts={alerts} />
          </motion.div>

          {/* Right Panel - Strategy & Chat */}
          <motion.div
            className="strategy-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StrategyChat />
          </motion.div>

          {/* Bottom Panel - Telemetry */}
          <motion.div
            className="telemetry-panel"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <TelemetryPanel telemetry={{ currentLap, latency }} />
          </motion.div>
        </div>

        {/* Status Bar */}
        <motion.div
          className="status-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'active' : 'inactive'}`}></span>
            <span className="status-text">{isConnected ? 'Live Session' : 'Disconnected'}</span>
          </div>
          <div className="latency-indicator">
            <span className="latency-value">{Math.round(latency)}ms</span>
            <span className="latency-label">Latency</span>
          </div>
          <div className="session-info">
            <span>Lap {currentLap}/58</span>
            <span>•</span>
            <span>Monza GP</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
