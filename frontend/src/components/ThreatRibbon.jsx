import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, Clock, Zap } from 'lucide-react';

function ThreatAlert({ alert, onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(alert.ttl_ms / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss(alert.id);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [alert.id, onDismiss]);

  const riskColor = alert.risk_attack_now > 0.7 ? '#ff4444' :
                   alert.risk_attack_now > 0.4 ? '#ffaa00' : '#44ff44';

  return (
    <motion.div
      className="threat-alert"
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        boxShadow: `0 0 ${20 + timeLeft * 5}px ${riskColor}40`
      }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.3 }}
      style={{
        borderLeft: `4px solid ${riskColor}`,
        animation: `supernova-pulse 2s ease-in-out infinite`
      }}
    >
      <div className="alert-header">
        <div className="alert-title">
          <AlertTriangle size={20} color={riskColor} />
          <span>THREAT ALERT</span>
        </div>
        <div className="alert-timer">
          <Clock size={16} />
          <span>{timeLeft.toFixed(1)}s</span>
        </div>
      </div>

      <div className="alert-content">
        <div className="alert-main">
          <span className="rival-id">{alert.rival_id}</span>
          <span className="turn-number">T{alert.turn}</span>
        </div>

        <div className="alert-recommendation">
          {alert.recommendation}
        </div>

        <div className="alert-risk">
          <TrendingUp size={16} />
          <span>{Math.round(alert.risk_attack_now * 100)}% Attack Risk</span>
        </div>
      </div>

      <div className="alert-reasons">
        {alert.why.map((reason, index) => (
          <motion.div
            key={index}
            className="reason-chip"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {reason}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ThreatRibbon({ alerts }) {
  const [displayAlerts, setDisplayAlerts] = useState([]);

  useEffect(() => {
    // Add new alerts
    alerts.forEach(alert => {
      if (!displayAlerts.find(a => a.id === alert.id)) {
        setDisplayAlerts(prev => [...prev, { ...alert, id: Date.now() + Math.random() }]);
      }
    });

    // Remove expired alerts
    setDisplayAlerts(prev => prev.filter(alert =>
      !alerts.some(a => a.id === alert.id && a.expired)
    ));
  }, [alerts, displayAlerts]);

  const dismissAlert = (alertId) => {
    setDisplayAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="threat-ribbon-container">
      <div className="panel-header">
        <h3>Threat Analysis</h3>
        <div className="threat-stats">
          <div className="stat-item">
            <Zap size={16} />
            <span>{displayAlerts.length} Active</span>
          </div>
          <div className="stat-item">
            <TrendingUp size={16} />
            <span>{Math.round(displayAlerts.reduce((acc, a) => acc + a.risk_attack_now, 0) / Math.max(displayAlerts.length, 1) * 100)}% Avg Risk</span>
          </div>
        </div>
      </div>

      <div className="threat-ribbon">
        <AnimatePresence>
          {displayAlerts.map(alert => (
            <ThreatAlert
              key={alert.id}
              alert={alert}
              onDismiss={dismissAlert}
            />
          ))}
        </AnimatePresence>

        {displayAlerts.length === 0 && (
          <motion.div
            className="no-threats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="no-threats-icon">🌌</div>
            <p>All clear. Monitoring rivals...</p>
          </motion.div>
        )}
      </div>

      <div className="threat-history">
        <h4>Recent Threats</h4>
        <div className="history-list">
          {alerts.slice(-5).reverse().map((alert, index) => (
            <motion.div
              key={`${alert.ts}-${index}`}
              className="history-item"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="history-time">
                {new Date(alert.ts).toLocaleTimeString()}
              </span>
              <span className="history-rival">{alert.rival_id}</span>
              <span className="history-turn">T{alert.turn}</span>
              <span className="history-risk">{Math.round(alert.risk_attack_now * 100)}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThreatRibbon;
