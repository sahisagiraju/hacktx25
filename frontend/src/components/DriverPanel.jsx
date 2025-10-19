import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import TelemetryPanel from './TelemetryPanel';
import { ArrowLeft, Activity, Radio, AlertTriangle, TrendingUp } from 'lucide-react';

const DriverPanel = ({ selectedDriver, onDriverSelect }) => {
  const { telemetryData, radioData, anomalies, summaries } = useWebSocket();
  const [driverData, setDriverData] = useState(null);
  const [driverRadio, setDriverRadio] = useState([]);
  const [driverAnomalies, setDriverAnomalies] = useState([]);
  const [driverSummary, setDriverSummary] = useState(null);

  useEffect(() => {
    if (selectedDriver) {
      const data = telemetryData[selectedDriver.id];
      setDriverData(data);

      // Filter radio messages for this driver
      const radio = radioData.filter(msg => msg.driver_id === selectedDriver.id);
      setDriverRadio(radio);

      // Get anomalies for this driver
      const anomaly = anomalies[selectedDriver.id];
      setDriverAnomalies(anomaly ? [anomaly] : []);

      // Get summary for this driver
      const summary = summaries[selectedDriver.id];
      setDriverSummary(summary);
    }
  }, [selectedDriver, telemetryData, radioData, anomalies, summaries]);

  const getPerformanceMetrics = () => {
    if (!driverData) return null;

    return {
      speed: driverData.speed_kph,
      throttle: driverData.throttle_pct * 100,
      brake: driverData.brake_pct * 100,
      gear: driverData.gear,
      lap: driverData.lap,
      sector: driverData.sector,
      distance: driverData.distance_m
    };
  };

  const getPerformanceGrade = (metrics) => {
    if (!metrics) return 'N/A';
    
    const speed = metrics.speed;
    const throttle = metrics.throttle;
    
    if (speed > 280 && throttle > 80) return 'A+';
    if (speed > 270 && throttle > 70) return 'A';
    if (speed > 260 && throttle > 60) return 'B+';
    if (speed > 250 && throttle > 50) return 'B';
    if (speed > 240 && throttle > 40) return 'C+';
    return 'C';
  };

  const getPerformanceColor = (grade) => {
    switch (grade) {
      case 'A+': return 'text-f1-green';
      case 'A': return 'text-f1-green';
      case 'B+': return 'text-f1-yellow';
      case 'B': return 'text-f1-yellow';
      case 'C+': return 'text-f1-orange';
      case 'C': return 'text-f1-red';
      default: return 'text-gray-400';
    }
  };

  if (!selectedDriver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl text-gray-400">No driver selected</h2>
          <p className="text-gray-500">Select a driver from the dashboard to view detailed telemetry</p>
        </div>
      </div>
    );
  }

  const metrics = getPerformanceMetrics();
  const performanceGrade = getPerformanceGrade(metrics);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onDriverSelect(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold text-white">{selectedDriver.name}</h1>
            <p className="text-gray-300">{selectedDriver.team}</p>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Speed</p>
                <p className="text-3xl font-bold text-white">
                  {metrics?.speed || 0} km/h
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-f1-blue" />
            </div>
          </div>

          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Performance Grade</p>
                <p className={`text-3xl font-bold ${getPerformanceColor(performanceGrade)}`}>
                  {performanceGrade}
                </p>
              </div>
              <Activity className="w-8 h-8 text-f1-green" />
            </div>
          </div>

          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Lap</p>
                <p className="text-3xl font-bold text-white">
                  {metrics?.lap || 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-f1-yellow rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-black">{metrics?.sector || 0}</span>
              </div>
            </div>
          </div>

          <div className="galaxy-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Anomalies</p>
                <p className={`text-3xl font-bold ${driverAnomalies.length > 0 ? 'text-f1-red' : 'text-f1-green'}`}>
                  {driverAnomalies.length}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${driverAnomalies.length > 0 ? 'text-f1-red' : 'text-f1-green'}`} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telemetry Panel */}
          <div className="lg:col-span-2">
            <TelemetryPanel driver={selectedDriver} />
          </div>

          {/* Radio Communications */}
          <div className="lg:col-span-1">
            <div className="galaxy-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Radio className="w-5 h-5 mr-2" />
                Radio Communications
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {driverRadio.length > 0 ? (
                  driverRadio.map((message, index) => (
                    <div key={index} className="radio-transcript">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {message.team}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.ts).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{message.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No radio communications</p>
                )}
              </div>
            </div>

            {/* AI Summary */}
            {driverSummary && (
              <div className="galaxy-card p-6 mt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  AI Analysis
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-galaxy-blue/50 rounded-lg border border-galaxy-glow/30">
                    <p className="text-sm text-gray-300">{driverSummary.summary}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Confidence: {(driverSummary.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Anomalies */}
            {driverAnomalies.length > 0 && (
              <div className="galaxy-card p-6 mt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-f1-red" />
                  Recent Anomalies
                </h2>
                <div className="space-y-3">
                  {driverAnomalies.map((anomaly, index) => (
                    <div key={index} className="anomaly-alert galaxy-card p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {anomaly.top_anomaly?.feature}
                        </span>
                        <span className="text-xs text-f1-red">
                          Score: {anomaly.top_anomaly?.score?.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Value: {anomaly.top_anomaly?.value} (Baseline: {anomaly.top_anomaly?.baseline})
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPanel;
