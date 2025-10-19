import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RangerDashboard from './components/RangerDashboard';
import DriverPanel from './components/DriverPanel';
import RadioComms from './components/RadioComms';
import DriverAnalysis from './components/DriverAnalysis';
import StrategyValidation from './components/StrategyValidation';
import VoiceIndicator from './components/VoiceIndicator';
import ThreatRibbon from './components/ThreatRibbon';
import { WebSocketProvider } from './context/WebSocketContext';
import logo from './assets/logo.png';
import './App.css';

function AppContent() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen text-white flex" style={{ background: 'linear-gradient(135deg, #0f0a2e 0%, #1a1453 25%, #1e0f4a 50%, #2d1560 75%, #3b1a6d 100%)' }}>
      {/* Moving Stars Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="stars-layer-1"></div>
        <div className="stars-layer-2"></div>
        <div className="stars-layer-3"></div>
      </div>

      {/* R.A.N.G.E.R Sidebar */}
      <div className="w-80 ranger-sidebar relative z-20 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-galaxy-glow/30">
              <div className="flex items-center space-x-3">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-white ranger-text-glow">R.A.C.E</h1>
                  <p className="text-sm text-gray-400">Real-time Analysis & Control Engine</p>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="p-6 space-y-4">
              <div className="galaxy-card p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="ranger-status-indicator"></div>
                  <span className="text-sm font-medium text-white">SYSTEM ONLINE</span>
                </div>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-f1-green">Operational</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drivers:</span>
                    <span className="text-f1-blue">3 Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="text-f1-yellow">Race Control</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    location.pathname === '/'
                      ? 'bg-f1-blue/20 border border-f1-blue/30 text-white'
                      : 'bg-transparent border border-gray-700/30 text-gray-300 hover:bg-gray-700/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5">📊</div>
                    <span className="font-medium">Central Console</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/driver-analysis')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    location.pathname === '/driver-analysis'
                      ? 'bg-f1-blue/20 border border-f1-blue/30 text-white'
                      : 'bg-transparent border border-gray-700/30 text-gray-300 hover:bg-gray-700/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5">🏎️</div>
                    <span className="font-medium">Driver Analysis</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/radio')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    location.pathname === '/radio'
                      ? 'bg-f1-blue/20 border border-f1-blue/30 text-white'
                      : 'bg-transparent border border-gray-700/30 text-gray-300 hover:bg-gray-700/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5">📡</div>
                    <span className="font-medium">Radio Comms</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/strategy')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    location.pathname === '/strategy'
                      ? 'bg-f1-blue/20 border border-f1-blue/30 text-white'
                      : 'bg-transparent border border-gray-700/30 text-gray-300 hover:bg-gray-700/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5">🤖</div>
                    <span className="font-medium">Strategy Validation</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Threat Assessment & Voice Control */}
            <div className="px-6 pb-4 space-y-4">
              <ThreatRibbon />
              <VoiceIndicator />
            </div>

            {/* Bottom Status */}
            <div className="p-6">
              <div className="galaxy-card p-4">
                <div className="text-xs text-gray-400 mb-2">Last Update</div>
                <div className="text-sm text-white ranger-mono">
                  {new Date().toLocaleString('en-US', {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })} UTC
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col relative z-10">
            {/* R.A.N.G.E.R Header */}
            <div className="ranger-header p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-white ranger-text-glow">DASHBOARD</h2>
                <div className="flex items-center space-x-2">
                  <div className="ranger-status-indicator"></div>
                  <span className="text-sm text-f1-green">LIVE</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 ranger-mono">
                  LAST UPDATE: {new Date().toLocaleString('en-US', { 
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} UTC
                </div>
                <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                  🔔
                </button>
                <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                  🔄
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <main className="flex-1 p-6">
              <Routes>
                <Route
                  path="/"
                  element={
                    <RangerDashboard
                      selectedDriver={selectedDriver}
                      onDriverSelect={setSelectedDriver}
                    />
                  }
                />
                <Route
                  path="/driver-analysis"
                  element={<DriverAnalysis />}
                />
                <Route
                  path="/radio"
                  element={<RadioComms />}
                />
                <Route
                  path="/strategy"
                  element={<StrategyValidation />}
                />
                <Route
                  path="/driver/:driverId"
                  element={
                    <DriverPanel
                      selectedDriver={selectedDriver}
                      onDriverSelect={setSelectedDriver}
                    />
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
  );
}

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <AppContent />
      </Router>
    </WebSocketProvider>
  );
}

export default App;

