import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [telemetryData, setTelemetryData] = useState({});
  const [radioData, setRadioData] = useState([]);
  const [anomalies, setAnomalies] = useState({});
  const [summaries, setSummaries] = useState({});
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'telemetry':
              setTelemetryData(prev => ({
                ...prev,
                [data.data.driver_id]: {
                  ...data.data,
                  timestamp: new Date().toISOString()
                }
              }));
              break;
              
            case 'radio':
              setRadioData(prev => [data.data, ...prev.slice(0, 49)]); // Keep last 50 messages
              break;
              
            case 'anomaly':
              setAnomalies(prev => ({
                ...prev,
                [data.data.driver_id]: {
                  ...data.data,
                  timestamp: new Date().toISOString()
                }
              }));
              break;
              
            case 'summary':
              setSummaries(prev => ({
                ...prev,
                [data.data.driver_id]: {
                  ...data.data,
                  timestamp: new Date().toISOString()
                }
              }));
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          
          reconnectTimeoutRef.current = setTimeout(() => {
                console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
                connect();
              }, delay);
        } else {
          setError('Failed to connect to server. Please refresh the page.');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Please check your network connection.');
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to create connection. Please refresh the page.');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const subscribeToDriver = (driverId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_driver',
        driver_id: driverId
      }));
    }
  };

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    isConnected,
    telemetryData,
    radioData,
    anomalies,
    summaries,
    error,
    subscribeToDriver,
    sendMessage,
    reconnect: connect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
