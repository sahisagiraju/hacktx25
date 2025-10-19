import React from 'react';
import { Link } from 'react-router-dom';
import { Wifi, WifiOff, Activity, Radio } from 'lucide-react';

const Header = ({ isConnected, onConnectionChange }) => {
  return (
    <header className="bg-galaxy-blue/90 backdrop-blur-md border-b border-galaxy-glow/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-f1-red to-f1-yellow rounded-full flex items-center justify-center animate-pulse-slow">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-f1-green rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white glow-text">
                  F1 Race Engineer AI
                </h1>
                <p className="text-sm text-gray-300">
                  Real-time Telemetry Analysis
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/drivers" 
              className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
            >
              <Radio className="w-4 h-4" />
              <span>Drivers</span>
            </Link>
          </nav>

          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-f1-green animate-pulse" />
                  <span className="text-f1-green text-sm font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-f1-red animate-pulse" />
                  <span className="text-f1-red text-sm font-medium">Disconnected</span>
                </>
              )}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-f1-green animate-pulse' : 'bg-f1-red'
              }`}></div>
              <span className="text-xs text-gray-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
