import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { Activity, Radio, AlertTriangle, TrendingUp, Target, Zap, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const DriverAnalysis = () => {
  const { telemetryData, radioData, anomalies, isConnected } = useWebSocket();
  const [selectedDriver, setSelectedDriver] = useState('driver_1');
  const [driverStrategies, setDriverStrategies] = useState({});
  const [codewords, setCodewords] = useState([]);

  // Strategy decoder - maps common phrases to meanings
  const strategyDecoder = {
    'push push push': 'Driver instructed to maximize speed and overtake',
    'box box box': 'Driver ordered to pit immediately',
    'save fuel': 'Driver must conserve fuel, reduce throttle application',
    'plan b': 'Switch to alternative race strategy',
    'full speed ahead': 'Driver accelerates at maximum capacity',
    'hold position': 'Maintain current race position, no aggressive moves',
    'defend defend': 'Driver must protect position from overtaking',
    'undercut': 'Pit early to gain track position advantage',
    'overcut': 'Stay out longer than competitor before pitting',
    'multi 21': 'Team orders to maintain position hierarchy'
  };

  useEffect(() => {
    // Analyze radio data for strategies
    const strategies = {};
    const detectedCodewords = [];

    radioData.forEach((message) => {
      const text = message.text.toLowerCase();
      const driverId = message.driver_id || 'unknown';

      if (!strategies[driverId]) {
        strategies[driverId] = {
          summary: [],
          recentMessages: [],
          detectedCodes: []
        };
      }

      // Detect codewords
      Object.keys(strategyDecoder).forEach((codeword) => {
        if (text.includes(codeword)) {
          const codeData = {
            phrase: codeword,
            meaning: strategyDecoder[codeword],
            timestamp: message.ts,
            driver: driverId
          };

          if (!detectedCodewords.find(c => c.phrase === codeword && c.driver === driverId)) {
            detectedCodewords.push(codeData);
          }

          if (!strategies[driverId].detectedCodes.find(c => c === codeword)) {
            strategies[driverId].detectedCodes.push(codeword);
          }
        }
      });

      // Add to recent messages
      strategies[driverId].recentMessages.push(message.text);
    });

    // Generate strategy summaries
    Object.keys(strategies).forEach((driverId) => {
      const strategy = strategies[driverId];
      const summary = [];

      if (strategy.detectedCodes.includes('push push push')) {
        summary.push('Aggressive pace targeting faster lap times');
      }
      if (strategy.detectedCodes.includes('save fuel')) {
        summary.push('Fuel conservation mode - lift and coast active');
      }
      if (strategy.detectedCodes.includes('undercut') || strategy.detectedCodes.includes('box box box')) {
        summary.push('Early pit stop strategy for track position gain');
      }
      if (strategy.detectedCodes.includes('defend defend')) {
        summary.push('Defensive driving to protect current position');
      }
      if (strategy.detectedCodes.includes('plan b')) {
        summary.push('Alternative strategy deployed - adapting to race conditions');
      }

      // Default strategies if none detected
      if (summary.length === 0) {
        summary.push('Standard race pace with tire management');
        summary.push('Monitoring gap to cars ahead and behind');
        summary.push('DRS activation in designated zones');
        summary.push('Optimal fuel consumption targeting race distance');
      }

      strategies[driverId].summary = summary.slice(0, 5);
    });

    setDriverStrategies(strategies);
    setCodewords(detectedCodewords.slice(-5)); // Keep last 5 codewords
  }, [radioData]);

  const activeDrivers = Object.keys(telemetryData)
    .filter(id => ['driver_1', 'driver_2', 'driver_3'].includes(id))
    .map(driverId => ({
      id: driverId,
      name: `Driver ${driverId.split('_')[1]}`,
      team: `Team ${driverId.split('_')[1]}`,
      data: telemetryData[driverId],
      anomaly: anomalies[driverId]
    }));

  const currentDriver = activeDrivers.find(d => d.id === selectedDriver) || activeDrivers[0] || null;
  const currentStrategy = driverStrategies[selectedDriver] || { summary: [], detectedCodes: [] };

  const getStatusColor = (driver) => {
    if (!driver) return 'text-gray-500';
    if (driver.anomaly && driver.anomaly.is_anomaly) return 'text-red-500';
    return 'text-green-500';
  };

  // If no drivers available yet, show loading state
  if (activeDrivers.length === 0) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-cyan-400 text-lg">Waiting for driver data...</p>
          <p className="text-gray-500 text-sm mt-2">Establishing connection to telemetry systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold glow-text-cyan mb-2 header-text">
          DRIVER ANALYSIS
        </h1>
        <p className="text-cyan-400/80 text-sm flex items-center gap-2 terminal-text">
          <Target className="w-4 h-4 animate-pulse text-cyan-400" />
          Comprehensive driver performance and strategy analysis
        </p>
      </motion.div>

      {/* Driver Selector */}
      <div className="flex gap-4 mb-6">
        {activeDrivers.map((driver) => (
          <motion.button
            key={driver.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDriver(driver.id)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedDriver === driver.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            {driver.name}
          </motion.button>
        ))}
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Statistics - Large Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Stats */}
          <Card className="comet-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Current Performance - {currentDriver?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentDriver?.data ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Speed</p>
                    <motion.p
                      key={currentDriver.data.speed_kph}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-white terminal-text"
                    >
                      {Math.round(currentDriver.data.speed_kph)} km/h
                    </motion.p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Current Lap</p>
                    <motion.p
                      key={currentDriver.data.lap}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-cyan-400 terminal-text"
                    >
                      {currentDriver.data.lap}
                    </motion.p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Sector</p>
                    <p className="text-3xl font-bold text-purple-400 terminal-text">
                      {currentDriver.data.sector}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Throttle</p>
                    <p className="text-3xl font-bold text-green-400 terminal-text">
                      {Math.round(currentDriver.data.throttle_pct)}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Brake</p>
                    <p className="text-3xl font-bold text-orange-400 terminal-text">
                      {Math.round(currentDriver.data.brake_pct)}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm">Gear</p>
                    <p className="text-3xl font-bold text-yellow-400 terminal-text">
                      {currentDriver.data.gear}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No telemetry data available</p>
              )}
            </CardContent>
          </Card>

          {/* Strategy Summary */}
          <Card className="comet-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Active Strategy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentStrategy.summary.length > 0 ? (
                  currentStrategy.summary.map((strategy, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                    >
                      <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white text-sm">{strategy}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <Zap className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <p className="text-white text-sm">Standard race pace with tire management</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <Zap className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <p className="text-white text-sm">Monitoring gap to cars ahead and behind</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <Zap className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <p className="text-white text-sm">DRS activation in designated zones</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <Zap className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <p className="text-white text-sm">Optimal fuel consumption targeting race distance</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Codewords and Quick Stats */}
        <div className="space-y-6">
          {/* Detected Codewords */}
          <Card className="comet-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-400" />
                Decoded Strategy Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {codewords.length > 0 ? (
                  codewords.map((code, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-card p-4 rounded-lg border border-yellow-400/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded uppercase">
                          {code.phrase}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {code.meaning}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {code.driver} • {new Date(code.timestamp).toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-sm">No strategy signals detected yet</p>
                    <p className="text-gray-500 text-xs mt-2">Listening for radio codewords...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          <Card className="comet-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Drivers</p>
                  <p className="text-2xl font-bold text-white terminal-text">
                    {activeDrivers.length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="comet-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Radio Messages</p>
                  <p className="text-2xl font-bold text-white terminal-text">
                    {radioData.length}
                  </p>
                </div>
                <Radio className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="comet-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className={`text-2xl font-bold terminal-text ${getStatusColor(currentDriver)}`}>
                    {currentDriver?.anomaly?.is_anomaly ? 'ANOMALY' : currentDriver ? 'NORMAL' : 'N/A'}
                  </p>
                </div>
                <AlertTriangle className={`w-8 h-8 ${getStatusColor(currentDriver)}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverAnalysis;
