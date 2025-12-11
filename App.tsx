import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Particles from './components/Particles';
import UIControls from './components/UIControls';
import HandTracker from './components/HandTracker';
import { ShapeType } from './types';
import { DEFAULT_COLOR } from './constants';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.ChristmasTree);
  const [particleColor, setParticleColor] = useState<string>('#2ecc71'); // Start with Tree Green
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [handFactor, setHandFactor] = useState(0); // 0 (Closed) to 1 (Open)
  const [isHandDetected, setIsHandDetected] = useState(false);

  const handleToggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const handleHandUpdate = (isOpen: boolean, openness: number) => {
    // Openness comes in ~0.0 to 1.0
    // We smooth it slightly in the Particle component, 
    // but here we just pass the raw detected value.
    setHandFactor(openness);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Particles 
            shape={currentShape} 
            color={particleColor} 
            handFactor={handFactor}
            isHandDetected={isHandDetected}
          />
          
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={5} 
            maxDistance={20}
            autoRotate={!isHandDetected}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10">
        <UIControls
          currentShape={currentShape}
          onShapeChange={setCurrentShape}
          currentColor={particleColor}
          onColorChange={setParticleColor}
          isFullScreen={isFullScreen}
          onToggleFullScreen={handleToggleFullScreen}
          handFactor={handFactor}
        />
      </div>

      {/* Logic / Invisible or Corner */}
      <HandTracker 
        onHandUpdate={handleHandUpdate} 
        onDetectionStateChange={setIsHandDetected}
      />
    </div>
  );
};

export default App;
