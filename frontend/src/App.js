import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DriverPanel from './components/DriverPanel';
import TelemetryPanel from './components/TelemetryPanel';
import StrategyChat from './components/StrategyChat';
import CelestialMap from './components/CelestialMap';
import VoiceIndicator from './components/VoiceIndicator';
import ThreatRibbon from './components/ThreatRibbon';
import { WebSocketProvider } from './context/WebSocketContext';
import './App.css';

function App() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  return (
    <WebSocketProvider>
      <Router>
        <div className="min-h-screen bg-galaxy-blue text-white">
          {/* Background Galaxy Effect */}
          <div className="fixed inset-0 bg-galaxy bg-stars opacity-30 pointer-events-none"></div>
          
          {/* Header */}
          <Header 
            isConnected={isConnected}
            onConnectionChange={setIsConnected}
          />
          
          {/* Main Content */}
          <main className="relative z-10">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    selectedDriver={selectedDriver}
                    onDriverSelect={setSelectedDriver}
                  />
                } 
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
          
          {/* Floating Components */}
          <div className="fixed bottom-4 right-4 z-20 space-y-2">
            <VoiceIndicator />
          </div>
          
          <div className="fixed top-20 right-4 z-20">
            <ThreatRibbon />
          </div>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

export default App;

