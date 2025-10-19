import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import DriverPanel from './DriverPanel';
import TelemetryPanel from './TelemetryPanel';
import StrategyChat from './StrategyChat';
import CelestialMap from './CelestialMap';
import { Activity, Radio, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = ({ selectedDriver, onDriverSelect }) => {
  const { telemetryData, radioData, anomalies, isConnected } = useWebSocket();
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);

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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 glow-text">
            Race Control Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time F1 telemetry analysis and radio communication monitoring
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Drivers</p>
                <p className="text-2xl font-bold text-white">{activeDrivers.length}</p>
              </div>
              <Activity className="w-8 h-8 text-f1-blue" />
            </div>
          </div>

          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Radio Messages</p>
                <p className="text-2xl font-bold text-white">{radioData.length}</p>
              </div>
              <Radio className="w-8 h-8 text-f1-yellow" />
            </div>
          </div>

          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Anomalies Detected</p>
                <p className="text-2xl font-bold text-f1-red">{recentAnomalies.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-f1-red" />
            </div>
          </div>

          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Connection</p>
                <p className={`text-2xl font-bold ${isConnected ? 'text-f1-green' : 'text-f1-red'}`}>
                  {isConnected ? 'Live' : 'Offline'}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full ${isConnected ? 'bg-f1-green' : 'bg-f1-red'} animate-pulse`}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Driver Panels */}
          <div className="lg:col-span-2">
            <div className="galaxy-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Driver Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDrivers.map((driver) => {
                  const status = getDriverStatus(driver.id);
                  return (
                    <div
                      key={driver.id}
                      className={`driver-card galaxy-card p-4 cursor-pointer transition-all duration-300 ${
                        selectedDriver?.id === driver.id ? 'selected' : ''
                      }`}
                      onClick={() => onDriverSelect(driver)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{driver.name}</h3>
                        <div className={`flex items-center space-x-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="text-xs capitalize">{status}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        <p>Team: {driver.team}</p>
                        <p>Last Update: {driver.lastUpdate ? new Date(driver.lastUpdate).toLocaleTimeString() : 'Never'}</p>
                      </div>

                      {driver.data && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Speed:</span>
                            <span className="text-white">{driver.data.speed_kph} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Lap:</span>
                            <span className="text-white">{driver.data.lap}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Anomalies */}
          <div className="lg:col-span-1">
            <div className="galaxy-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-f1-red" />
                Recent Anomalies
              </h2>
              <div className="space-y-3">
                {recentAnomalies.length > 0 ? (
                  recentAnomalies.map((anomaly, index) => (
                    <div key={index} className="anomaly-alert galaxy-card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {anomaly.driver_id}
                        </span>
                        <span className="text-xs text-f1-red">
                          Score: {anomaly.top_anomaly?.score?.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">
                        {anomaly.top_anomaly?.feature}: {anomaly.top_anomaly?.value}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No anomalies detected</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Panel for Selected Driver */}
        {selectedDriver && (
          <div className="mt-8">
            <TelemetryPanel driver={selectedDriver} />
          </div>
        )}

        {/* Strategy Chat */}
        <div className="mt-8">
          <StrategyChat />
        </div>

        {/* Celestial Map */}
        <div className="mt-8">
          <CelestialMap />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
