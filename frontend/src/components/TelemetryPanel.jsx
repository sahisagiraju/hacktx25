import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Brake, Gauge as GaugeIcon } from 'lucide-react';

const TelemetryPanel = ({ driver }) => {
  const { telemetryData } = useWebSocket();
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    if (driver && telemetryData[driver.id]) {
      const data = telemetryData[driver.id];
      setCurrentData(data);
      
      // Add to history (keep last 50 points)
      setTelemetryHistory(prev => {
        const newHistory = [...prev, {
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          speed: data.speed_kph,
          throttle: data.throttle_pct * 100,
          brake: data.brake_pct * 100,
          gear: data.gear,
          lap: data.lap,
          sector: data.sector
        }];
        return newHistory.slice(-50);
      });
    }
  }, [driver, telemetryData]);

  const GaugeComponent = ({ value, max, label, color, icon: Icon }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 50; // radius = 50
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="galaxy-card p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 mr-2" style={{ color }} />
          <h3 className="text-lg font-semibold text-white">{label}</h3>
        </div>
        <div className="relative">
          <div className="w-32 h-32 mx-auto">
            <svg width="128" height="128" className="transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="rgba(75, 85, 99, 0.3)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke={color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{value.toFixed(1)}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SpeedGauge = ({ value }) => (
    <div className="galaxy-card p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <Activity className="w-6 h-6 mr-2 text-f1-blue" />
        <h3 className="text-lg font-semibold text-white">Speed</h3>
      </div>
      <div className="relative">
        <div className="w-40 h-40 mx-auto">
          <div className="relative w-full h-full">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(30, 58, 138, 0.3)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - value / 300)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{value.toFixed(0)}</div>
                <div className="text-sm text-gray-400">km/h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ThrottleBrakeGauge = ({ throttle, brake }) => (
    <div className="galaxy-card p-6">
      <div className="flex items-center justify-center mb-4">
        <GaugeIcon className="w-6 h-6 mr-2 text-f1-yellow" />
        <h3 className="text-lg font-semibold text-white">Throttle & Brake</h3>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Throttle</span>
            <span className="text-sm text-white">{throttle.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-f1-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${throttle}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Brake</span>
            <span className="text-sm text-white">{brake.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-f1-red h-2 rounded-full transition-all duration-300"
              style={{ width: `${brake}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  const GearDisplay = ({ gear }) => (
    <div className="galaxy-card p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <Zap className="w-6 h-6 mr-2 text-f1-purple" />
        <h3 className="text-lg font-semibold text-white">Gear</h3>
      </div>
      <div className="text-6xl font-bold text-white mb-2">{gear}</div>
      <div className="text-sm text-gray-400">Current Gear</div>
    </div>
  );

  const LapInfo = ({ data }) => (
    <div className="galaxy-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Lap Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400">Lap</div>
          <div className="text-2xl font-bold text-white">{data?.lap || 0}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Sector</div>
          <div className="text-2xl font-bold text-white">{data?.sector || 0}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Distance</div>
          <div className="text-lg font-semibold text-white">
            {data?.distance_m ? (data.distance_m / 1000).toFixed(2) : 0} km
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Track Position</div>
          <div className="text-lg font-semibold text-white">
            {data?.track_x ? (data.track_x * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    </div>
  );

  if (!driver || !currentData) {
    return (
      <div className="galaxy-card p-8 text-center">
        <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl text-gray-400 mb-2">No telemetry data</h2>
        <p className="text-gray-500">Waiting for data from {driver?.name || 'driver'}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpeedGauge value={currentData.speed_kph} />
        <ThrottleBrakeGauge 
          throttle={currentData.throttle_pct * 100} 
          brake={currentData.brake_pct * 100} 
        />
        <GearDisplay gear={currentData.gear} />
        <LapInfo data={currentData} />
      </div>

      {/* Historical Charts */}
      <div className="galaxy-card p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Performance Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Speed Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 58, 138, 0.3)" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 27, 59, 0.9)', 
                    border: '1px solid rgba(30, 58, 138, 0.3)',
                    borderRadius: '8px',
                    color: '#white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-4">Throttle & Brake</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 58, 138, 0.3)" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 27, 59, 0.9)', 
                    border: '1px solid rgba(30, 58, 138, 0.3)',
                    borderRadius: '8px',
                    color: '#white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="throttle" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="brake" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryPanel;
