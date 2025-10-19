import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, Clock, Zap, Thermometer } from 'lucide-react';

function TelemetryGauge({ label, value, unit, max, color = '#00ffff', icon: Icon }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="telemetry-gauge">
      <div className="gauge-header">
        <Icon size={16} />
        <span className="gauge-label">{label}</span>
        <span className="gauge-value">
          {value.toFixed(1)}{unit}
        </span>
      </div>

      <div className="gauge-track">
        <motion.div
          className="gauge-fill"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function LapTimer({ currentLap, totalLaps = 58 }) {
  return (
    <div className="lap-timer">
      <div className="timer-icon">
        <Clock size={24} />
      </div>
      <div className="timer-info">
        <div className="current-lap">Lap {currentLap}</div>
        <div className="total-laps">of {totalLaps}</div>
      </div>
      <div className="lap-progress">
        <div className="progress-ring">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="rgba(0, 255, 255, 0.2)"
              strokeWidth="3"
            />
            <motion.circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="#00ffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 25}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 25 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 25 * (1 - currentLap / totalLaps)
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              transform="rotate(-90 30 30)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TelemetryPanel({ telemetry }) {
  const [liveData, setLiveData] = useState({
    speed: 284.7,
    ers: 0.67,
    brakeTemp: 245,
    tireTemp: 78,
    deltaTime: -0.234,
    position: 3,
    gapAhead: 1.234,
    gapBehind: 0.876
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        speed: prev.speed + (Math.random() - 0.5) * 5,
        ers: Math.max(0, Math.min(1, prev.ers + (Math.random() - 0.5) * 0.1)),
        brakeTemp: Math.max(200, Math.min(300, prev.brakeTemp + (Math.random() - 0.5) * 10)),
        tireTemp: Math.max(60, Math.min(100, prev.tireTemp + (Math.random() - 0.5) * 5)),
        deltaTime: prev.deltaTime + (Math.random() - 0.5) * 0.1,
        gapAhead: Math.max(0.1, prev.gapAhead + (Math.random() - 0.5) * 0.2),
        gapBehind: Math.max(0.1, prev.gapBehind + (Math.random() - 0.5) * 0.2)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="telemetry-panel-container">
      <div className="panel-header">
        <h3>Live Telemetry</h3>
        <div className="telemetry-status">
          <div className="status-dot live"></div>
          <span>Real-time</span>
        </div>
      </div>

      <div className="telemetry-grid">
        <div className="telemetry-main">
          <LapTimer currentLap={telemetry.currentLap} />

          <div className="main-stats">
            <div className="stat-card">
              <div className="stat-label">Position</div>
              <div className="stat-value primary">P{telemetry.currentLap}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Δ to Leader</div>
              <div className={`stat-value ${liveData.deltaTime < 0 ? 'positive' : 'negative'}`}>
                {liveData.deltaTime < 0 ? '+' : ''}{liveData.deltaTime.toFixed(3)}s
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Gap Ahead</div>
              <div className="stat-value">{liveData.gapAhead.toFixed(3)}s</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Gap Behind</div>
              <div className="stat-value">{liveData.gapBehind.toFixed(3)}s</div>
            </div>
          </div>
        </div>

        <div className="telemetry-details">
          <div className="gauges-section">
            <TelemetryGauge
              label="Speed"
              value={liveData.speed}
              unit="km/h"
              max={350}
              color="#00ffff"
              icon={TrendingUp}
            />

            <TelemetryGauge
              label="ERS Energy"
              value={liveData.ers * 100}
              unit="%"
              max={100}
              color="#ffaa00"
              icon={Zap}
            />

            <TelemetryGauge
              label="Brake Temp"
              value={liveData.brakeTemp}
              unit="°C"
              max={300}
              color="#ff4444"
              icon={Thermometer}
            />

            <TelemetryGauge
              label="Tire Temp"
              value={liveData.tireTemp}
              unit="°C"
              max={120}
              color="#44ff44"
              icon={Thermometer}
            />
          </div>

          <div className="system-status">
            <h4>System Status</h4>
            <div className="status-grid">
              <div className="status-item">
                <div className="status-indicator ok"></div>
                <span>Engine</span>
              </div>
              <div className="status-item">
                <div className="status-indicator ok"></div>
                <span>ERS</span>
              </div>
              <div className="status-item">
                <div className="status-indicator warning"></div>
                <span>Brakes</span>
              </div>
              <div className="status-item">
                <div className="status-indicator ok"></div>
                <span>Tires</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="latency-display">
        <div className="latency-label">System Latency:</div>
        <div className={`latency-value ${telemetry.latency < 100 ? 'good' : telemetry.latency < 200 ? 'warning' : 'critical'}`}>
          {telemetry.latency}ms
        </div>
      </div>
    </div>
  );
}

export default TelemetryPanel;
