import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateParticles } from '../utils/shapeGenerator';
import { PARTICLE_COUNT } from '../constants';

interface ParticlesProps {
  shape: ShapeType;
  color: string;
  handFactor: number; // 0 to 1
  isHandDetected: boolean;
}

const Particles: React.FC<ParticlesProps> = ({ shape, color, handFactor, isHandDetected }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Current positions of particles
  const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Target positions (where they want to go)
  const targetPositions = useMemo(() => generateParticles(shape), [shape]);
  
  // Velocities for physics feel
  const velocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));

  const particleColor = useMemo(() => new THREE.Color(color), [color]);

  useEffect(() => {
    // Reset velocities on shape change for a burst effect
    for(let i=0; i<velocities.current.length; i++) {
        velocities.current[i] = (Math.random() - 0.5) * 0.1;
    }
  }, [shape]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const target = targetPositions;
    const time = state.clock.getElapsedTime();

    // Interaction Params
    // Hand open (1.0) = High diffusion/Scale up
    // Hand closed (0.0) = Tight formation
    
    // Smooth the hand factor input
    const smoothedFactor = THREE.MathUtils.lerp(0, handFactor, 0.1); 
    const spread = isHandDetected ? 0.2 + (handFactor * 2.0) : 0.2; // Base spread + hand influence
    const noiseAmp = isHandDetected ? (handFactor * 0.5) : 0.1; // More jitter when open

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 1. Calculate Attraction Force to Target
      const tx = target[i3];
      const ty = target[i3 + 1];
      const tz = target[i3 + 2];

      // Current
      const cx = currentPositions.current[i3];
      const cy = currentPositions.current[i3 + 1];
      const cz = currentPositions.current[i3 + 2];

      // Physics: Spring/Lerp towards target
      // If hand is OPEN, we expand the target positions (Scale)
      // And we add noise (Diffusion)
      
      const expansion = 1 + (isHandDetected ? handFactor * 0.8 : 0);
      
      const targetX = tx * expansion;
      const targetY = ty * expansion;
      const targetZ = tz * expansion;

      // Move current towards target
      // Speed factor
      const speed = 0.05;
      
      currentPositions.current[i3] += (targetX - cx) * speed;
      currentPositions.current[i3 + 1] += (targetY - cy) * speed;
      currentPositions.current[i3 + 2] += (targetZ - cz) * speed;

      // Add Noise / Diffusion (Breathing effect)
      const noise = Math.sin(time * 2 + i) * noiseAmp;
      
      // Update the actual geometry buffer
      positions[i3] = currentPositions.current[i3] + noise;
      positions[i3 + 1] = currentPositions.current[i3 + 1] + noise;
      positions[i3 + 2] = currentPositions.current[i3 + 2] + noise;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate entire system slowly
    pointsRef.current.rotation.y = time * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={particleColor}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Particles;
