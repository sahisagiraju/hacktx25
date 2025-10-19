import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import Sidebar from './Sidebar';
import TelemetryPanel from './TelemetryPanel';
import StrategyChat from './StrategyChat';
import CelestialMap3D from './CelestialMap3D';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Activity, Radio, AlertTriangle, Gauge } from 'lucide-react';

// Animation variants following style.txt patterns
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

const Dashboard = ({ selectedDriver, onDriverSelect }) => {
  const { telemetryData, radioData, anomalies, isConnected } = useWebSocket();
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  // Filter to only show allowed drivers
  const allowedDrivers = ['driver_1', 'driver_2', 'driver_3'];

  useEffect(() => {
    // Extract active drivers from telemetry data - only allowed drivers
    const drivers = Object.keys(telemetryData)
      .filter(driverId => allowedDrivers.includes(driverId))
      .map(driverId => ({
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64">
        {/* Container with proper spacing per styles.txt */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Header with space-themed typography */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-bold glow-text-cyan mb-2 header-text tracking-wider">
              RACE CONTROL DASHBOARD
            </h1>
            <p className="text-cyan-400/80 text-sm flex items-center gap-2 terminal-text">
              <Activity className="w-4 h-4 animate-pulse text-cyan-400" />
              Real-time F1 telemetry analysis • radio communication monitoring
            </p>
          </motion.div>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="telemetry">Live Telemetry</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="3dtrack">3D Track</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">

              {/* Status Overview Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="comet-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Active Drivers</p>
                        <motion.p
                          className="text-3xl font-bold text-foreground"
                          key={activeDrivers.length}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          {activeDrivers.length}
                        </motion.p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="comet-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Radio Messages</p>
                        <motion.p
                          className="text-3xl font-bold text-foreground"
                          key={radioData.length}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          {radioData.length}
                        </motion.p>
                      </div>
                      <div className="p-3 bg-chart-3/10 rounded-lg">
                        <Radio className="w-6 h-6 text-chart-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="comet-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Anomalies Detected</p>
                        <motion.p
                          className="text-3xl font-bold text-destructive"
                          key={recentAnomalies.length}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          {recentAnomalies.length}
                        </motion.p>
                      </div>
                      <div className="p-3 bg-destructive/10 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="comet-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Connection</p>
                        <motion.p
                          className={`text-3xl font-bold ${isConnected ? 'text-chart-2' : 'text-destructive'}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isConnected ? 'Live' : 'Offline'}
                        </motion.p>
                      </div>
                      <motion.div
                        className={`w-8 h-8 rounded-full ${isConnected ? 'bg-chart-2' : 'bg-destructive'} shadow-sm`}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Driver Status Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="comet-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Driver Status
                      </CardTitle>
                      <CardDescription>Real-time driver telemetry and status monitoring</CardDescription>
                    </CardHeader>
                    <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {activeDrivers.map((driver, index) => {
                    const status = getDriverStatus(driver.id);
                    return (
                      <motion.div
                        key={driver.id}
                        className={`driver-card galaxy-card p-5 cursor-pointer ${
                          selectedDriver?.id === driver.id ? 'selected ring-2 ring-primary' : ''
                        }`}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.05,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        whileHover={{
                          scale: 1.02,
                          y: -4,
                          transition: { duration: 0.15 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onDriverSelect(driver)}
                        layout
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{driver.name}</h3>
                          <motion.div
                            className={`flex items-center space-x-1 ${getStatusColor(status)}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                          >
                            {getStatusIcon(status)}
                            <span className="text-xs capitalize">{status}</span>
                          </motion.div>
                        </div>

                        <div className="text-sm text-gray-400">
                          <p>Team: {driver.team}</p>
                          <p>Last Update: {driver.lastUpdate ? new Date(driver.lastUpdate).toLocaleTimeString() : 'Never'}</p>
                        </div>

                        {driver.data && (
                          <motion.div
                            className="mt-3 grid grid-cols-2 gap-2 text-xs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                          >
                            <div className="flex justify-between">
                              <span className="text-gray-400">Speed:</span>
                              <motion.span
                                className="text-white"
                                key={driver.data.speed_kph}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                {Math.round(driver.data.speed_kph)} km/h
                              </motion.span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Lap:</span>
                              <motion.span
                                className="text-white"
                                key={driver.data.lap}
                                initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
                                animate={{ scale: 1, color: 'white' }}
                                transition={{ duration: 0.3 }}
                              >
                                {driver.data.lap}
                              </motion.span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Anomalies */}
                <div className="lg:col-span-1">
                  <Card className="comet-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Recent Anomalies
                      </CardTitle>
                      <CardDescription>Active anomalies and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {recentAnomalies.length > 0 ? (
                    recentAnomalies.map((anomaly, index) => (
                      <motion.div
                        key={`${anomaly.driver_id}-${anomaly.timestamp}-${index}`}
                        className="anomaly-alert galaxy-card p-3"
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          transition: {
                            duration: 0.25,
                            delay: index * 0.05
                          }
                        }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          scale: 0.95,
                          transition: { duration: 0.2 }
                        }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 0 25px hsl(var(--destructive) / 0.6)',
                          transition: { duration: 0.15 }
                        }}
                        layout
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">
                            {anomaly.driver_id}
                          </span>
                          <motion.span
                            className="text-xs text-f1-red"
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                          >
                            Score: {anomaly.top_anomaly?.score?.toFixed(1)}
                          </motion.span>
                        </div>
                        <p className="text-xs text-gray-300">
                          {anomaly.top_anomaly?.feature}: {anomaly.top_anomaly?.value}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(anomaly.timestamp).toLocaleTimeString()}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.p
                      className="text-gray-400 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      No anomalies detected
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Telemetry Tab */}
            <TabsContent value="telemetry" className="space-y-6 mt-6">
              {selectedDriver && <TelemetryPanel driver={selectedDriver} />}
              {!selectedDriver && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Gauge className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a driver to view detailed telemetry</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Strategy Tab */}
            <TabsContent value="strategy" className="space-y-6 mt-6">
              <StrategyChat />
            </TabsContent>

            {/* 3D Track Tab */}
            <TabsContent value="3dtrack" className="space-y-6 mt-6">
              <CelestialMap3D />
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
