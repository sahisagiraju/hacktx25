import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { AlertTriangle, Shield, Zap, Clock } from 'lucide-react';

const ThreatRibbon = () => {
  const { anomalies, telemetryData } = useWebSocket();
  const [threats, setThreats] = useState([]);
  const [threatLevel, setThreatLevel] = useState('low');

  useEffect(() => {
    // Process anomalies into threat format
    const newThreats = Object.values(anomalies)
      .filter(anomaly => anomaly.is_anomaly)
      .map(anomaly => ({
        id: `threat-${anomaly.driver_id}-${anomaly.timestamp}`,
        driverId: anomaly.driver_id,
        severity: anomaly.confidence > 0.8 ? 'high' : anomaly.confidence > 0.6 ? 'medium' : 'low',
        type: anomaly.top_anomaly?.feature || 'unknown',
        value: anomaly.top_anomaly?.value || 0,
        score: anomaly.top_anomaly?.score || 0,
        timestamp: anomaly.timestamp,
        description: `Anomaly in ${anomaly.top_anomaly?.feature}: ${anomaly.top_anomaly?.value}`
      }));

    setThreats(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newUniqueThreats = newThreats.filter(t => !existingIds.has(t.id));
      return [...newUniqueThreats, ...prev].slice(0, 10); // Keep last 10 threats
    });
  }, [anomalies]);

  useEffect(() => {
    // Calculate overall threat level
    const highThreats = threats.filter(t => t.severity === 'high').length;
    const mediumThreats = threats.filter(t => t.severity === 'medium').length;
    
    if (highThreats > 0) {
      setThreatLevel('high');
    } else if (mediumThreats > 2) {
      setThreatLevel('medium');
    } else {
      setThreatLevel('low');
    }
  }, [threats]);

  const getThreatColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-f1-red';
      case 'medium': return 'text-f1-yellow';
      case 'low': return 'text-f1-green';
      default: return 'text-gray-400';
    }
  };

  const getThreatBg = (severity) => {
    switch (severity) {
      case 'high': return 'bg-black/90 border-f1-red/30';
      case 'medium': return 'bg-black/90 border-f1-yellow/30';
      case 'low': return 'bg-black/90 border-f1-green/30';
      default: return 'bg-black/90 border-gray-700/30';
    }
  };

  const getThreatIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-f1-red" />;
      case 'medium': return <Shield className="w-4 h-4 text-f1-yellow" />;
      case 'low': return <Zap className="w-4 h-4 text-f1-green" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getThreatLevelColor = () => {
    switch (threatLevel) {
      case 'high': return 'text-f1-red';
      case 'medium': return 'text-f1-yellow';
      case 'low': return 'text-f1-green';
      default: return 'text-gray-400';
    }
  };

  const getThreatLevelBg = () => {
    switch (threatLevel) {
      case 'high': return 'bg-black/90 border-f1-red/30';
      case 'medium': return 'bg-black/90 border-f1-yellow/30';
      case 'low': return 'bg-black/90 border-f1-green/30';
      default: return 'bg-black/90 border-gray-700/30';
    }
  };

  return (
    <div className="galaxy-card p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Threat Assessment
        </h3>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getThreatLevelBg()} ${getThreatLevelColor()}`}>
          {threatLevel.toUpperCase()}
        </div>
      </div>

      {/* Threat Level Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Threat Level</span>
          <span className={`text-sm font-medium ${getThreatLevelColor()}`}>
            {threatLevel.toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-black/90 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              threatLevel === 'high' ? 'bg-f1-red' :
              threatLevel === 'medium' ? 'bg-f1-yellow' : 'bg-f1-green'
            }`}
            style={{
              width: threatLevel === 'high' ? '100%' : threatLevel === 'medium' ? '60%' : '20%'
            }}
          ></div>
        </div>
      </div>

      {/* Active Threats */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {threats.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active threats</p>
            <p className="text-xs">All systems normal</p>
          </div>
        ) : (
          threats.map((threat) => (
            <div
              key={threat.id}
              className={`p-3 rounded-lg border ${getThreatBg(threat.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getThreatIcon(threat.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {threat.driverId}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(threat.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-1">{threat.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Score: {threat.score.toFixed(1)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      threat.severity === 'high' ? 'bg-black/80 border border-f1-red/30 text-f1-red' :
                      threat.severity === 'medium' ? 'bg-black/80 border border-f1-yellow/30 text-f1-yellow' :
                      'bg-black/80 border border-f1-green/30 text-f1-green'
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Threat Statistics */}
      <div className="mt-4 pt-4 border-t border-galaxy-glow/30">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-f1-red">
              {threats.filter(t => t.severity === 'high').length}
            </div>
            <div className="text-xs text-gray-400">High</div>
          </div>
          <div>
            <div className="text-lg font-bold text-f1-yellow">
              {threats.filter(t => t.severity === 'medium').length}
            </div>
            <div className="text-xs text-gray-400">Medium</div>
          </div>
          <div>
            <div className="text-lg font-bold text-f1-green">
              {threats.filter(t => t.severity === 'low').length}
            </div>
            <div className="text-xs text-gray-400">Low</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatRibbon;
