import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { MapPin, Navigation } from 'lucide-react';

const CelestialMap = () => {
  // Always default to safe containers in case context hasn’t populated yet
  const { telemetryData: telemetryRaw, anomalies: anomaliesRaw } = useWebSocket();
  const telemetryData = telemetryRaw ?? {};
  const anomalies = anomaliesRaw ?? {};

  const [trackData, setTrackData] = useState([]);
  const [selectedSector, setSelectedSector] = useState(1);

  useEffect(() => {
    // Generate track layout data once
    const sectors = 3;
    const pointsPerSector = 20;
    const trackPoints = [];

    for (let sector = 1; sector <= sectors; sector++) {
      for (let i = 0; i < pointsPerSector; i++) {
        const progress = i / (pointsPerSector - 1);
        const angle = (sector - 1) * 120 + progress * 120; // 120 deg/sector
        const radius = 100 + Math.sin(progress * Math.PI) * 30; // oval-ish

        trackPoints.push({
          id: `sector-${sector}-${i}`,
          sector,
          x: Math.cos((angle * Math.PI) / 180) * radius,
          y: Math.sin((angle * Math.PI) / 180) * radius,
          progress,
          angle,
        });
      }
    }

    setTrackData(trackPoints);
  }, []);

  const getDriverPosition = (driverId) => {
    const data = telemetryData?.[driverId];
    if (!data) return null;

    const sector = data.sector || 1;
    const trackPosition = Math.max(0, Math.min(1, data.track_x ?? 0));

    const sectorPoints = trackData.filter((p) => p.sector === sector);
    if (sectorPoints.length === 0) return null;

    const pointIndex = Math.floor(trackPosition * (sectorPoints.length - 1));
    const point = sectorPoints[pointIndex];
    if (!point) return null;

    return { x: point.x, y: point.y, driverId, data };
  };

  const getDriverColor = (driverId) =>
    anomalies?.[driverId]?.is_anomaly ? '#dc2626' : '#3b82f6';

  const getDriverSize = (driverId) => {
    const speed = telemetryData?.[driverId]?.speed_kph ?? 0;
    return Math.max(6, Math.min(16, 8 + speed / 50)); // 6–16px
  };

  const getSectorStats = (sector) => {
    const drivers = Object.keys(telemetryData)
      .map((driverId) => {
        const d = telemetryData[driverId] ?? {};
        return {
          driverId,
          sector: d.sector ?? 1,
          speed: d.speed_kph ?? 0,
          anomaly: !!(anomalies?.[driverId]?.is_anomaly),
        };
      })
      .filter((d) => d.sector === sector);

    const avgSpeed =
      drivers.length > 0
        ? drivers.reduce((sum, d) => sum + d.speed, 0) / drivers.length
        : 0;

    return {
      totalDrivers: drivers.length,
      avgSpeed,
      anomalies: drivers.filter((d) => d.anomaly).length,
    };
  };

  // Early exit while track points are being generated
  if (trackData.length === 0) {
    return (
      <div className="galaxy-card p-6 text-gray-300">
        Loading track data…
      </div>
    );
  }

  return (
    <div className="galaxy-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Navigation className="w-6 h-6 mr-2" />
          Celestial Track Map
        </h2>
        <div className="flex space-x-2">
          {[1, 2, 3].map((sector) => (
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
            {/* Track Outline — guarded */}
            {trackData.length > 1 &&
              trackData.map((point, index) => {
                const nextPoint = trackData[(index + 1) % trackData.length];
                if (!point || !nextPoint) return null;
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

            {/* Sector Markers — guarded */}
            {trackData.length > 0 && [1, 2, 3].map((sector) => {
              const sectorPoints = trackData.filter((p) => p.sector === sector);
              if (sectorPoints.length === 0) return null;
              const startPoint = sectorPoints[0];
              if (!startPoint || typeof startPoint.x === 'undefined' || typeof startPoint.y === 'undefined') return null;

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

            {/* Driver Positions — guarded */}
            {Object.keys(telemetryData).map((driverId) => {
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
                    {driverId.split('_')[1] ?? driverId}
                  </text>
                </g>
              );
            })}

            {/* Anomaly Indicators — guarded */}
            {Object.keys(anomalies).map((driverId) => {
              const anomaly = anomalies?.[driverId];
              if (!anomaly?.is_anomaly) return null;
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
              <div className="w-3 h-3 bg-f1-blue rounded-full" />
              <span className="text-gray-300">Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse" />
              <span className="text-gray-300">Anomaly</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-f1-yellow rounded-full" />
              <span className="text-gray-300">Sector Markers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((sector) => {
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
