import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Line, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import * as THREE from 'three';
import { MapPin, Navigation, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip, TooltipProvider } from './ui/Tooltip';
import { Button } from './ui/Button';

// 3D Racing Car Component
function RacingCar({ position, rotation, color, driverId, speed, isAnomaly }) {
  const carRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (carRef.current) {
      // Smooth movement animation
      carRef.current.position.lerp(
        new THREE.Vector3(position[0], position[1], position[2]),
        0.1
      );

      // Car tilts based on speed
      const tilt = Math.sin(Date.now() * 0.005) * (speed / 300) * 0.1;
      carRef.current.rotation.z = tilt;
    }
  });

  return (
    <group
      ref={carRef}
      rotation={[0, rotation, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.4, 1.6]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={isAnomaly ? '#dc2626' : color}
          emissiveIntensity={isAnomaly ? 0.5 : 0.1}
        />
      </mesh>

      {/* Cockpit */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial
          color="#1a1a1a"
          transparent
          opacity={0.6}
          metalness={0.9}
        />
      </mesh>

      {/* Rear Wing */}
      <mesh position={[0, 0.5, -0.7]} castShadow>
        <boxGeometry args={[1, 0.1, 0.3]} />
        <meshStandardMaterial color={color} metalness={0.7} />
      </mesh>

      {/* Wheels */}
      {[[-0.4, -0.2, 0.5], [0.4, -0.2, 0.5], [-0.4, -0.2, -0.5], [0.4, -0.2, -0.5]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </mesh>
      ))}

      {/* Speed Trail Effect */}
      {speed > 200 && (
        <mesh position={[0, 0, -1.5]}>
          <coneGeometry args={[0.3, 1, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Anomaly Warning Indicator */}
      {isAnomaly && (
        <Sphere args={[1.2, 16, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#dc2626" transparent opacity={0.15} wireframe />
        </Sphere>
      )}

      {/* Driver Label */}
      {hovered && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {driverId}
          {`\n${Math.round(speed)} km/h`}
        </Text>
      )}
    </group>
  );
}

// 3D Track Component
function Track3D({ trackData }) {
  const trackPoints = useMemo(() => {
    return trackData.map(point => [point.x / 30, 0, point.y / 30]);
  }, [trackData]);

  return (
    <group>
      {/* Main Track Surface */}
      <Line
        points={trackPoints}
        color="#1e3a8a"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* Track Glow Effect */}
      <Line
        points={trackPoints}
        color="#3b82f6"
        lineWidth={6}
        transparent
        opacity={0.2}
      />

      {/* Track Base Platform */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0a1628"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>

      {/* Sector Markers */}
      {[1, 2, 3].map((sector) => {
        const sectorPoints = trackData.filter(p => p.sector === sector);
        if (sectorPoints.length === 0) return null;
        const startPoint = sectorPoints[0];

        return (
          <group key={sector}>
            {/* Sector Beacon */}
            <mesh position={[startPoint.x / 30, 0.5, startPoint.y / 30]}>
              <cylinderGeometry args={[0.3, 0.3, 1, 8]} />
              <meshStandardMaterial
                color={sector === 1 ? '#10b981' : sector === 2 ? '#fbbf24' : '#dc2626'}
                emissive={sector === 1 ? '#10b981' : sector === 2 ? '#fbbf24' : '#dc2626'}
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Sector Label */}
            <Text
              position={[startPoint.x / 30, 1.5, startPoint.y / 30]}
              fontSize={0.5}
              color="white"
              anchorX="center"
            >
              S{sector}
            </Text>
          </group>
        );
      })}

      {/* Grid Lines */}
      {Array.from({ length: 21 }, (_, i) => i - 10).map((i) => (
        <React.Fragment key={`grid-${i}`}>
          <Line
            points={[[i, -0.49, -10], [i, -0.49, 10]]}
            color="#1e3a8a"
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
          <Line
            points={[[-10, -0.49, i], [10, -0.49, i]]}
            color="#1e3a8a"
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
        </React.Fragment>
      ))}
    </group>
  );
}

// Progress Bar Component
function ProgressIndicator({ drivers, telemetryData }) {
  return (
    <div className="galaxy-card p-4 backdrop-blur-md">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-primary" />
        Race Progress
      </h3>
      <div className="space-y-2">
        {drivers.slice(0, 5).map((driver, idx) => {
          const data = telemetryData[driver];
          const progress = data ? (data.track_x * 100) : 0;
          const speed = data ? data.speed_kph : 0;

          return (
            <div key={driver} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{driver}</span>
                <span className="text-foreground">{Math.round(speed)} km/h</span>
              </div>
              <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="absolute h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: `hsl(${217 + idx * 30}, 91%, 60%)`
                  }}
                />
                <div
                  className="absolute h-full w-4 rounded-full blur-sm"
                  style={{
                    left: `${Math.min(progress, 100)}%`,
                    transform: 'translateX(-50%)',
                    background: `hsl(${217 + idx * 30}, 91%, 60%)`,
                    opacity: 0.6
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Starfield Component for 3D Background
function Starfield() {
  const starsRef = useRef();

  // Generate random star positions
  const starPositions = useMemo(() => {
    const positions = [];
    const starCount = 800;

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = Math.random() * 50 + 10;
      const z = (Math.random() - 0.5) * 100;
      positions.push(x, y, z);
    }

    return new Float32Array(positions);
  }, []);

  // Animate stars with slow twinkling
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color="#ffffff"
        transparent
        opacity={0.25}
        sizeAttenuation={true}
      />
    </points>
  );
}

// Main Scene Component
function Scene({ trackData, telemetryData, anomalies }) {
  const cameraRef = useRef();

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 12, 12]} fov={60} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#3b82f6" />
      <hemisphereLight intensity={0.3} groundColor="#0a1628" />

      {/* Dimly lit stars in background */}
      <Starfield />

      {/* Track */}
      <Track3D trackData={trackData} />

      {/* Racing Cars */}
      {Object.keys(telemetryData).map((driverId) => {
        const data = telemetryData[driverId];
        const anomaly = anomalies[driverId];

        if (!data) return null;

        // Calculate 3D position based on overall track progress (track_x)
        const trackProgress = Math.max(0, Math.min(1, data.track_x ?? 0));

        // Calculate absolute position on entire track based on track_x
        const totalPointIndex = Math.floor(trackProgress * (trackData.length - 1));
        const point = trackData[totalPointIndex];
        const nextPoint = trackData[Math.min(totalPointIndex + 1, trackData.length - 1)];

        if (!point) return null;

        const x = point.x / 30;
        const z = point.y / 30;
        const rotation = nextPoint ? Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) : 0;

        // Driver-specific colors
        const colors = ['#3b82f6', '#10b981', '#fbbf24', '#f97316', '#8b5cf6', '#ec4899'];
        const colorIndex = parseInt(driverId.split('_')[1] || '1') - 1;
        const color = colors[colorIndex % colors.length];

        return (
          <RacingCar
            key={driverId}
            position={[x, 0, z]}
            rotation={rotation}
            color={color}
            driverId={driverId}
            speed={data.speed_kph || 0}
            isAnomaly={anomaly?.is_anomaly || false}
          />
        );
      })}

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a1628', 10, 30]} />
    </>
  );
}

// Main Component
const CelestialMap3D = () => {
  const { telemetryData = {}, anomalies = {} } = useWebSocket();
  const [trackData, setTrackData] = useState([]);
  const [cameraReset, setCameraReset] = useState(0);

  // Filter to only show allowed drivers
  const allowedDrivers = ['driver_1', 'driver_2', 'driver_3'];
  const filteredTelemetryData = Object.keys(telemetryData)
    .filter(key => allowedDrivers.includes(key))
    .reduce((obj, key) => {
      obj[key] = telemetryData[key];
      return obj;
    }, {});

  const filteredAnomalies = Object.keys(anomalies)
    .filter(key => allowedDrivers.includes(key))
    .reduce((obj, key) => {
      obj[key] = anomalies[key];
      return obj;
    }, {});

  useEffect(() => {
    // Generate track layout data
    const sectors = 3;
    const pointsPerSector = 20;
    const trackPoints = [];

    for (let sector = 1; sector <= sectors; sector++) {
      for (let i = 0; i < pointsPerSector; i++) {
        const progress = i / (pointsPerSector - 1);
        const angle = (sector - 1) * 120 + progress * 120;
        const radius = 100 + Math.sin(progress * Math.PI) * 30;

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

  const drivers = Object.keys(filteredTelemetryData);

  if (trackData.length === 0) {
    return (
      <div className="galaxy-card p-6 text-gray-300">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Navigation className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p>Initializing 3D Track...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        className="galaxy-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h2
            className="text-2xl font-bold text-foreground flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.div
              className="p-2 bg-primary/10 rounded-lg"
              whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--primary) / 0.2)' }}
              transition={{ duration: 0.15 }}
            >
              <Navigation className="w-6 h-6 text-primary" />
            </motion.div>
            3D Interactive Track Map
          </motion.h2>
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Tooltip content="Reset camera to default view">
              <Button
                onClick={() => setCameraReset(prev => prev + 1)}
                variant="secondary"
                size="default"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset View</span>
              </Button>
            </Tooltip>
            <Tooltip content="Enter fullscreen mode">
              <Button
                variant="default"
                size="default"
                className="flex items-center gap-2"
                onClick={() => {
                  const elem = document.querySelector('.galaxy-card');
                  if (elem?.requestFullscreen) {
                    elem.requestFullscreen();
                  }
                }}
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </Button>
            </Tooltip>
          </motion.div>
        </div>

      <div className="relative">
        {/* Progress Overlay - Moved to top with more space */}
        {drivers.length > 0 && (
          <div className="mb-6">
            <ProgressIndicator drivers={drivers} telemetryData={filteredTelemetryData} />
          </div>
        )}

        {/* 3D Canvas */}
        <div className="w-full h-[750px] bg-[#0a1628] rounded-lg overflow-hidden border border-border">
          <Canvas
            key={cameraReset}
            shadows
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
          >
            <Scene trackData={trackData} telemetryData={filteredTelemetryData} anomalies={filteredAnomalies} />
          </Canvas>
        </div>

        {/* Controls Info */}
        <div className="absolute bottom-4 right-4 galaxy-card p-3 backdrop-blur-md text-xs">
          <p className="text-muted-foreground mb-1">🖱️ Drag to rotate</p>
          <p className="text-muted-foreground mb-1">🔍 Scroll to zoom</p>
          <p className="text-muted-foreground">👆 Hover cars for info</p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 galaxy-card p-3 backdrop-blur-md">
          <h4 className="text-sm font-semibold text-foreground mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-chart-1 rounded-full" />
              <span className="text-muted-foreground">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="text-muted-foreground">Anomaly</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-chart-2 rounded-sm" />
              <span className="text-muted-foreground">Sector 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-chart-3 rounded-sm" />
              <span className="text-muted-foreground">Sector 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-sm" />
              <span className="text-muted-foreground">Sector 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Statistics */}
      <motion.div
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {[1, 2, 3].map((sector, index) => {
          const driversInSector = drivers.filter(d => filteredTelemetryData[d]?.sector === sector);
          const avgSpeed = driversInSector.length > 0
            ? driversInSector.reduce((sum, d) => sum + (filteredTelemetryData[d]?.speed_kph || 0), 0) / driversInSector.length
            : 0;
          const anomalyCount = driversInSector.filter(d => filteredAnomalies[d]?.is_anomaly).length;

          return (
            <Tooltip key={`stats-${sector}`} content={`Track section ${sector} statistics`}>
              <motion.div
                className="galaxy-card p-4 cursor-pointer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -4,
                  transition: { duration: 0.15 }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">Sector {sector}</h3>
                  <motion.div whileHover={{ rotate: 15 }} transition={{ duration: 0.15 }}>
                    <MapPin className="w-4 h-4 text-primary" />
                  </motion.div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Drivers:</span>
                    <motion.span
                      className="text-foreground font-medium"
                      key={driversInSector.length}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {driversInSector.length}
                    </motion.span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Speed:</span>
                    <motion.span
                      className="text-foreground font-medium"
                      key={avgSpeed}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {avgSpeed.toFixed(0)} km/h
                    </motion.span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anomalies:</span>
                    <motion.span
                      className={anomalyCount > 0 ? 'text-destructive font-medium' : 'text-chart-2 font-medium'}
                      key={anomalyCount}
                      initial={anomalyCount > 0 ? { scale: 1.3 } : { scale: 1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.25, type: 'spring' }}
                    >
                      {anomalyCount}
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </Tooltip>
          );
        })}
      </motion.div>
    </motion.div>
    </TooltipProvider>
  );
};

export default CelestialMap3D;
