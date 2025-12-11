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
  
  // Random offsets for diffusion effect
  const randomOffsets = useMemo(() => {
    const offsets = new Float32Array(PARTICLE_COUNT * 3);
    for(let i=0; i<PARTICLE_COUNT * 3; i++) {
        offsets[i] = (Math.random() - 0.5) * 2; // -1 to 1
    }
    return offsets;
  }, []);

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
    const spread = isHandDetected ? smoothedFactor : 0; // 0 to 1
    
    // Config
    const baseScale = 1.0;
    const maxScale = 1.8;
    const currentScale = THREE.MathUtils.lerp(baseScale, maxScale, spread);
    
    const noiseAmp = isHandDetected ? (spread * 0.2) : 0.05; // Jitter amount
    const diffusionRadius = isHandDetected ? (spread * 3.0) : 0; // Scatter distance

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // 1. Target with Scale
      const tx = target[i3] * currentScale;
      const ty = target[i3 + 1] * currentScale;
      const tz = target[i3 + 2] * currentScale;

      // 2. Add Diffusion (Push away from center or random scatter)
      // We use the pre-calculated random offsets scaled by diffusionRadius
      const dx = randomOffsets[i3] * diffusionRadius;
      const dy = randomOffsets[i3 + 1] * diffusionRadius;
      const dz = randomOffsets[i3 + 2] * diffusionRadius;

      const targetX = tx + dx;
      const targetY = ty + dy;
      const targetZ = tz + dz;

      // Current pos
      const cx = currentPositions.current[i3];
      const cy = currentPositions.current[i3 + 1];
      const cz = currentPositions.current[i3 + 2];

      // Physics: Spring/Lerp towards target
      const speed = 0.08;
      
      currentPositions.current[i3] += (targetX - cx) * speed;
      currentPositions.current[i3 + 1] += (targetY - cy) * speed;
      currentPositions.current[i3 + 2] += (targetZ - cz) * speed;

      // Add slight breathing noise
      const breathing = Math.sin(time * 2 + i * 0.1) * noiseAmp;
      
      // Update the actual geometry buffer
      positions[i3] = currentPositions.current[i3] + breathing;
      positions[i3 + 1] = currentPositions.current[i3 + 1] + breathing;
      positions[i3 + 2] = currentPositions.current[i3 + 2] + breathing;
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
        size={0.12}
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