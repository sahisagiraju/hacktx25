import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Activity, Radio, AlertTriangle, TrendingUp, Zap, Brake, Gauge as GaugeIcon, Fuel, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CelestialMap3D from './CelestialMap3D';

const RangerDashboard = ({ selectedDriver, onDriverSelect }) => {
  const { telemetryData, radioData, anomalies, isConnected } = useWebSocket();
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [currentLap, setCurrentLap] = useState(1);
  const [fuelLevel, setFuelLevel] = useState(100);
  const [showFuelWarning, setShowFuelWarning] = useState(false);
  const [ersEnergy, setErsEnergy] = useState(51);
  const [brakeTemp, setBrakeTemp] = useState(1123);
  const [tireTemp, setTireTemp] = useState(120);
  const [avgSpeed, setAvgSpeed] = useState(250); // Start at realistic F1 speed
  const [targetSpeed, setTargetSpeed] = useState(250); // For smooth acceleration

  useEffect(() => {
    // Extract active drivers from telemetry data
    const drivers = Object.keys(telemetryData).map(driverId => ({
      id: driverId,
      name: `Driver ${driverId.split('_')[1]}`,
      team: `Team ${driverId.split('_')[1]}`,
      lastUpdate: telemetryData[driverId]?.timestamp,
      data: telemetryData[driverId]
    }));
    setActiveDrivers(drivers);
  }, [telemetryData]);

  useEffect(() => {
    // Collect recent anomalies
    const recent = Object.values(anomalies)
      .filter(anomaly => anomaly.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    setRecentAnomalies(recent);
  }, [anomalies]);

  // Sync current lap with driver telemetry data based on track_x progress
  useEffect(() => {
    if (activeDrivers.length > 0 && activeDrivers[0].data) {
      const trackProgress = activeDrivers[0].data.track_x || 0; // 0.0 to 1.0 (progress within current lap)
      const baseLap = activeDrivers[0].data.lap || 1;

      // Calculate total progress: completed laps + current progress
      // When lap=3 and track_x=0.5, we've completed 2 laps + 50% of lap 3 = 2.5 total
      const totalProgress = (baseLap - 1) + trackProgress;

      // Cap at 58 laps with modulus
      const cappedProgress = totalProgress > 58 ? ((totalProgress - 1) % 58) + 1 : totalProgress;
      setCurrentLap(cappedProgress);
    }
  }, [activeDrivers]);

  // Fuel system with warning at 20% - consume 90% over 58 laps (reach 10% at end)
  useEffect(() => {
    const fuelInterval = setInterval(() => {
      setFuelLevel((prevFuel) => {
        // Consume 90% fuel over 58 laps: 90/58 = ~1.55% per lap
        // Update every second, so we need faster consumption for visible progress
        const newFuel = Math.max(10, prevFuel - 0.025); // Decrease by 0.025% per second, stops at 10%

        if (newFuel <= 20 && newFuel > 10) {
          setShowFuelWarning(true);
        } else {
          setShowFuelWarning(false);
        }

        return newFuel;
      });
    }, 1000); // Update every second

    return () => clearInterval(fuelInterval);
  }, []);

  // Pitstop handler - resets everything
  const handlePitstop = () => {
    setFuelLevel(100);
    setShowFuelWarning(false);
    setErsEnergy(100);
    setBrakeTemp(800);
    setTireTemp(85);
  };

  // Varying telemetry data
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      // ERS varies between 20-100%
      setErsEnergy((prev) => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(20, Math.min(100, prev + change));
      });

      // Brake temp varies between 800-1300°C
      setBrakeTemp((prev) => {
        const change = (Math.random() - 0.5) * 50;
        return Math.max(800, Math.min(1300, prev + change));
      });

      // Tire temp varies between 80-140°C
      setTireTemp((prev) => {
        const change = (Math.random() - 0.5) * 15;
        return Math.max(80, Math.min(140, prev + change));
      });

      // Set new target speed every 5 seconds (realistic F1 range: 200-320 km/h)
      if (Math.random() < 0.4) { // 40% chance to change target speed
        const newTarget = 200 + Math.random() * 120; // Range: 200-320 km/h
        setTargetSpeed(newTarget);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(telemetryInterval);
  }, [activeDrivers]);

  // Realistic acceleration/deceleration - smooth transition to target speed
  useEffect(() => {
    const accelerationInterval = setInterval(() => {
      setAvgSpeed((currentSpeed) => {
        const difference = targetSpeed - currentSpeed;

        // Gradual acceleration/deceleration (max 15 km/h change per update)
        if (Math.abs(difference) < 2) {
          return Math.round(targetSpeed); // Close enough, snap to target (whole number)
        }

        const acceleration = Math.sign(difference) * Math.min(Math.abs(difference) * 0.3, 15);
        const newSpeed = currentSpeed + acceleration;

        // Ensure speed stays within realistic F1 bounds (never negative, max 350 km/h)
        // Always return whole number
        return Math.round(Math.max(0, Math.min(350, newSpeed)));
      });
    }, 100); // Update 10 times per second for smooth animation

    return () => clearInterval(accelerationInterval);
  }, [targetSpeed]);

  const getDriverStatus = (driverId) => {
    const anomaly = anomalies[driverId];
    if (anomaly && anomaly.is_anomaly) {
      return 'anomaly';
    }
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'anomaly': return 'text-f1-red';
      case 'normal': return 'text-f1-green';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'normal': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* R.A.N.G.E.R Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Analysis Panel */}
        <div className="galaxy-card comet-border p-6">
          <h2 className="text-lg font-bold text-white mb-4 ranger-text-glow">THREAT ANALYSIS</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-f1-blue mb-1">{recentAnomalies.length}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {recentAnomalies.length > 0 ? Math.round(recentAnomalies.reduce((sum, a) => sum + (a.confidence || 0), 0) / recentAnomalies.length * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400">Avg Risk</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-300 mb-4">
            {recentAnomalies.length === 0 ? 'All clear. Monitoring rivals...' : 'Threats detected. Analyzing...'}
          </div>
          <div className="border-t border-gray-700/30 pt-4">
            <div className="text-xs text-gray-400">RECENT THREATS</div>
            <div className="text-sm text-gray-500 mt-2">
              {recentAnomalies.length === 0 ? 'No recent threats detected' : `${recentAnomalies.length} threats active`}
            </div>
          </div>
        </div>

        {/* Activity Log Panel */}
        <div className="galaxy-card comet-border p-6">
          <h2 className="text-lg font-bold text-white mb-4 ranger-text-glow">ACTIVITY LOG</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {radioData.slice(0, 5).map((message, index) => (
              <div key={index} className="text-xs border-l-2 border-f1-blue pl-3">
                <div className="text-f1-blue font-mono">
                  {new Date(message.ts).toLocaleTimeString()}
                </div>
                <div className="text-gray-300 mt-1">
                  <span className="text-f1-green">{message.team}</span>: {message.text}
                </div>
              </div>
            ))}
            {radioData.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Fuel Level Panel */}
        <div className="galaxy-card comet-border p-6">
          <h2 className="text-lg font-bold text-white mb-4 ranger-text-glow flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            FUEL LEVEL
          </h2>
          <div className="text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative"
              style={{
                background: fuelLevel <= 20
                  ? 'conic-gradient(#ef4444 0deg, #ef4444 ' + (fuelLevel * 3.6) + 'deg, #374151 ' + (fuelLevel * 3.6) + 'deg)'
                  : 'conic-gradient(#10b981 0deg, #10b981 ' + (fuelLevel * 3.6) + 'deg, #374151 ' + (fuelLevel * 3.6) + 'deg)'
              }}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <Fuel className={`w-8 h-8 ${fuelLevel <= 20 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </motion.div>
            <motion.div
              className={`text-3xl font-bold mb-2 ranger-mono ${fuelLevel <= 20 ? 'text-red-500' : 'text-white'}`}
              animate={fuelLevel <= 20 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: fuelLevel <= 20 ? Infinity : 0 }}
            >
              {fuelLevel.toFixed(1)}%
            </motion.div>
            {fuelLevel <= 20 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-sm text-red-500 font-bold"
              >
                CRITICAL LEVEL
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Fuel Warning Alert - Above Motor Telemetry */}
      <AnimatePresence>
        {showFuelWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                  '0 0 40px rgba(239, 68, 68, 0.8)',
                  '0 0 20px rgba(239, 68, 68, 0.5)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="bg-red-500/20 border-2 border-red-500 rounded-lg p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold text-red-500 mb-1">FUEL WARNING</h3>
                    <p className="text-white">Fuel level critical: {fuelLevel.toFixed(1)}%</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePitstop}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold whitespace-nowrap"
                >
                  GO TO PITSTOP
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motor Telemetry Panel */}
      <div className="galaxy-card comet-border p-6">
        <h2 className="text-lg font-bold text-white mb-6 ranger-text-glow">MOTOR TELEMETRY</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2 ranger-mono">CURRENT LAP</div>
              <motion.div
                key={Math.ceil(currentLap)}
                initial={{ scale: 1.2, color: '#3b82f6' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-f1-blue ranger-mono"
              >
                {Math.ceil(currentLap)}/58
              </motion.div>
            </div>

            <div className="relative w-32 h-32 mx-auto">
              <div className="ranger-gauge w-full h-full flex items-center justify-center">
                <div className="text-2xl font-bold text-white ranger-mono z-10">
                  {Math.round((currentLap / 58) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">ERS ENERGY</span>
                <motion.span
                  className="text-f1-green ranger-mono"
                  key={ersEnergy}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  {Math.round(ersEnergy)}%
                </motion.span>
              </div>
              <div className="w-full h-2 bg-black/90 rounded-full overflow-hidden">
                <motion.div
                  className="ranger-progress-bar h-full"
                  animate={{ width: `${ersEnergy}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">BRAKE TEMP</span>
                <motion.span
                  className="text-f1-orange ranger-mono"
                  key={brakeTemp}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  {Math.round(brakeTemp)}°C
                </motion.span>
              </div>
              <div className="w-full h-2 bg-black/90 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-f1-orange to-f1-red"
                  animate={{ width: `${((brakeTemp - 800) / 500) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">TIRE TEMP</span>
                <motion.span
                  className="text-f1-yellow ranger-mono"
                  key={tireTemp}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                >
                  {Math.round(tireTemp)}°C
                </motion.span>
              </div>
              <div className="w-full h-2 bg-black/90 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-f1-yellow to-f1-orange"
                  animate={{ width: `${((tireTemp - 80) / 60) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">SPEED</div>
              <motion.div
                key={avgSpeed}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-white ranger-mono"
              >
                {avgSpeed} km/h
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Track Simulation */}
      <div className="galaxy-card comet-border p-6">
        <h2 className="text-lg font-bold text-white mb-6 ranger-text-glow">3D TRACK SIMULATION</h2>
        <div className="h-[500px]">
          <CelestialMap3D />
        </div>
      </div>

      {/* Driver Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeDrivers.map((driver) => {
          const status = getDriverStatus(driver.id);
          return (
            <div
              key={driver.id}
              className={`galaxy-card comet-border p-6 cursor-pointer transition-all duration-300 ${
                selectedDriver?.id === driver.id ? 'ranger-border-glow' : ''
              }`}
              onClick={() => onDriverSelect(driver)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white ranger-mono">{driver.name}</h3>
                <div className={`flex items-center space-x-2 ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="text-xs uppercase">{status}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Team:</span>
                  <span className="text-white">{driver.team}</span>
                </div>
                
                {driver.data && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Speed:</span>
                      <span className="text-f1-blue font-mono">{Math.round(driver.data.speed_kph)} km/h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Lap:</span>
                      <span className="text-white font-mono">{driver.data.lap}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sector:</span>
                      <span className="text-f1-yellow font-mono">{driver.data.sector}</span>
                    </div>
                  </>
                )}
                
                <div className="text-xs text-gray-500 mt-4">
                  Last Update: {driver.lastUpdate ? new Date(driver.lastUpdate).toLocaleTimeString() : 'Never'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="galaxy-card comet-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Drivers</p>
              <p className="text-2xl font-bold text-white ranger-mono">{activeDrivers.length}</p>
            </div>
            <Activity className="w-8 h-8 text-f1-blue" />
          </div>
        </div>

        <div className="galaxy-card comet-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Radio Messages</p>
              <p className="text-2xl font-bold text-white ranger-mono">{radioData.length}</p>
            </div>
            <Radio className="w-8 h-8 text-f1-yellow" />
          </div>
        </div>

        <div className="galaxy-card comet-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Anomalies</p>
              <p className="text-2xl font-bold text-f1-red ranger-mono">{recentAnomalies.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-f1-red" />
          </div>
        </div>

        <div className="galaxy-card comet-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Connection</p>
              <p className={`text-2xl font-bold ranger-mono ${isConnected ? 'text-f1-green' : 'text-f1-red'}`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full ${isConnected ? 'bg-f1-green' : 'bg-f1-red'} ranger-status-indicator`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangerDashboard;
