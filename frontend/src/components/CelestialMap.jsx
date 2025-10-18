import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function TrackRing({ radius = 8, segments = 64 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, segments, 0.1, 8, false);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#00ffff"
        emissive="#001122"
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function RivalStar({ position, rivalId, riskLevel = 0, isAlert = false }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation for threats
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 4) * riskLevel * 0.5;
      meshRef.current.scale.setScalar(pulseScale);

      if (isAlert) {
        meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
      }
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3]}>
        <meshStandardMaterial
          color={isAlert ? "#ff4444" : "#ffffff"}
          emissive={isAlert ? "#ff0000" : "#000033"}
          emissiveIntensity={isAlert ? 0.8 : 0.2}
        />
      </Sphere>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {rivalId}
      </Text>
      {isAlert && (
        <pointLight position={[0, 0, 0]} color="#ff0000" intensity={2} distance={5} />
      )}
    </group>
  );
}

function CelestialMap3D({ alerts }) {
  // Mock rival positions around the track
  const rivals = [
    { id: 'RBR_1', position: [6, 4, 0], riskLevel: 0.8 },
    { id: 'FER_2', position: [-4, 6, 0], riskLevel: 0.3 },
    { id: 'MCL_3', position: [-7, -3, 0], riskLevel: 0.5 },
    { id: 'MER_4', position: [3, -7, 0], riskLevel: 0.2 },
  ];

  // Check for active alerts
  const activeAlerts = alerts.filter(alert => alert.priority === 'critical');

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#001122" />

      <TrackRing />

      {rivals.map((rival) => {
        const isAlert = activeAlerts.some(alert => alert.rival_id === rival.id);
        return (
          <RivalStar
            key={rival.id}
            position={rival.position}
            rivalId={rival.id}
            riskLevel={rival.riskLevel}
            isAlert={isAlert}
          />
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
}

function CelestialMap({ alerts }) {
  return (
    <div className="celestial-map-container">
      <div className="panel-header">
        <h3>Celestial Map</h3>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-dot active"></div>
            <span>Live Rivals</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot threat"></div>
            <span>Threat Zone</span>
          </div>
        </div>
      </div>

      <div className="map-canvas">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <CelestialMap3D alerts={alerts} />
        </Canvas>
      </div>

      <div className="map-controls">
        <motion.button
          className="map-control-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Auto-rotate
        </motion.button>
        <motion.button
          className="map-control-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Follow Leader
        </motion.button>
      </div>
    </div>
  );
}

export default CelestialMap;
