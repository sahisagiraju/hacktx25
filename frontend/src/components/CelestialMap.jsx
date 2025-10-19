import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { MapPin, Navigation, Star, Zap } from 'lucide-react';

const CelestialMap = () => {
  const { telemetryData, anomalies } = useWebSocket();
  const [trackData, setTrackData] = useState([]);
  const [selectedSector, setSelectedSector] = useState(1);

  useEffect(() => {
    // Generate track layout data
    const generateTrackData = () => {
      const sectors = 3;
      const pointsPerSector = 20;
      const trackPoints = [];

      for (let sector = 1; sector <= sectors; sector++) {
        for (let i = 0; i < pointsPerSector; i++) {
          const progress = i / (pointsPerSector - 1);
          const angle = (sector - 1) * 120 + progress * 120; // 120 degrees per sector
          const radius = 100 + Math.sin(progress * Math.PI) * 30; // Oval shape
          
          trackPoints.push({
            id: `sector-${sector}-${i}`,
            sector,
            x: Math.cos(angle * Math.PI / 180) * radius,
            y: Math.sin(angle * Math.PI / 180) * radius,
            progress,
            angle
          });
        }
      }

      setTrackData(trackPoints);
    };

    generateTrackData();
  }, []);

  const getDriverPosition = (driverId) => {
    const data = telemetryData[driverId];
    if (!data) return null;

    const sector = data.sector || 1;
    const trackPosition = data.track_x || 0;
    
    // Find the closest track point
    const sectorPoints = trackData.filter(point => point.sector === sector);
    if (sectorPoints.length === 0) return null;

    const pointIndex = Math.floor(trackPosition * (sectorPoints.length - 1));
    const point = sectorPoints[pointIndex];
    
    return {
      x: point.x,
      y: point.y,
      driverId,
      data
    };
  };

  const getDriverColor = (driverId) => {
    const anomaly = anomalies[driverId];
    if (anomaly && anomaly.is_anomaly) {
      return '#dc2626'; // Red for anomalies
    }
    return '#3b82f6'; // Blue for normal
  };

  const getDriverSize = (driverId) => {
    const data = telemetryData[driverId];
    if (!data) return 8;
    
    // Size based on speed
    const speed = data.speed_kph || 0;
    return Math.max(6, Math.min(16, 8 + (speed / 50)));
  };

  const getSectorStats = (sector) => {
    const drivers = Object.keys(telemetryData).map(driverId => {
      const data = telemetryData[driverId];
      return {
        driverId,
        sector: data?.sector || 1,
        speed: data?.speed_kph || 0,
        anomaly: anomalies[driverId]?.is_anomaly || false
      };
    }).filter(driver => driver.sector === sector);

    return {
      totalDrivers: drivers.length,
      avgSpeed: drivers.length > 0 ? drivers.reduce((sum, d) => sum + d.speed, 0) / drivers.length : 0,
      anomalies: drivers.filter(d => d.anomaly).length
    };
  };

  return (
    <div className="galaxy-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Navigation className="w-6 h-6 mr-2" />
          Celestial Track Map
        </h2>
        <div className="flex space-x-2">
          {[1, 2, 3].map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedSector === sector
                  ? 'bg-f1-blue text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
              }`}
            >
              Sector {sector}
            </button>
          ))}
        </div>
      </div>

      {/* Track Visualization */}
      <div className="relative">
        <div className="w-full h-96 bg-galaxy-blue/30 rounded-lg border border-galaxy-glow/30 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="-150 -150 300 300"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Track Background */}
            <defs>
              <radialGradient id="trackGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(30, 58, 138, 0.1)" />
                <stop offset="100%" stopColor="rgba(30, 58, 138, 0.3)" />
              </radialGradient>
            </defs>
            
            {/* Track Outline */}
            {trackData.map((point, index) => {
              const nextPoint = trackData[(index + 1) % trackData.length];
              return (
                <line
                  key={`track-${index}`}
                  x1={point.x}
                  y1={point.y}
                  x2={nextPoint.x}
                  y2={nextPoint.y}
                  stroke="rgba(30, 58, 138, 0.4)"
                  strokeWidth="2"
                />
              );
            })}

            {/* Sector Markers */}
            {[1, 2, 3].map(sector => {
              const sectorPoints = trackData.filter(p => p.sector === sector);
              const startPoint = sectorPoints[0];
              const endPoint = sectorPoints[sectorPoints.length - 1];
              
              return (
                <g key={`sector-${sector}`}>
                  <circle
                    cx={startPoint.x}
                    cy={startPoint.y}
                    r="4"
                    fill={selectedSector === sector ? '#3b82f6' : 'rgba(30, 58, 138, 0.6)'}
                    className="animate-pulse"
                  />
                  <text
                    x={startPoint.x}
                    y={startPoint.y - 8}
                    textAnchor="middle"
                    className="text-xs fill-white"
                  >
                    S{sector}
                  </text>
                </g>
              );
            })}

            {/* Driver Positions */}
            {Object.keys(telemetryData).map(driverId => {
              const position = getDriverPosition(driverId);
              if (!position) return null;

              return (
                <g key={`driver-${driverId}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={getDriverSize(driverId)}
                    fill={getDriverColor(driverId)}
                    className="animate-pulse"
                  />
                  <text
                    x={position.x}
                    y={position.y + 4}
                    textAnchor="middle"
                    className="text-xs fill-white font-bold"
                  >
                    {driverId.split('_')[1]}
                  </text>
                </g>
              );
            })}

            {/* Anomaly Indicators */}
            {Object.keys(anomalies).map(driverId => {
              const anomaly = anomalies[driverId];
              if (!anomaly || !anomaly.is_anomaly) return null;

              const position = getDriverPosition(driverId);
              if (!position) return null;

              return (
                <g key={`anomaly-${driverId}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={getDriverSize(driverId) + 4}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-galaxy-blue/80 backdrop-blur-sm rounded-lg p-3 border border-galaxy-glow/30">
          <h4 className="text-sm font-semibold text-white mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-f1-blue rounded-full"></div>
              <span className="text-gray-300">Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse"></div>
              <span className="text-gray-300">Anomaly</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-f1-yellow rounded-full"></div>
              <span className="text-gray-300">Sector Markers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(sector => {
          const stats = getSectorStats(sector);
          return (
            <div
              key={`stats-${sector}`}
              className={`p-4 rounded-lg border ${
                selectedSector === sector
                  ? 'bg-f1-blue/10 border-f1-blue/30'
                  : 'bg-galaxy-blue/30 border-galaxy-glow/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Sector {sector}</h3>
                <MapPin className="w-4 h-4 text-f1-blue" />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Drivers:</span>
                  <span className="text-white">{stats.totalDrivers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Speed:</span>
                  <span className="text-white">{stats.avgSpeed.toFixed(0)} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Anomalies:</span>
                  <span className={stats.anomalies > 0 ? 'text-f1-red' : 'text-f1-green'}>
                    {stats.anomalies}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CelestialMap;
