import { PARTICLE_COUNT, CANVAS_SIZE } from '../constants';
import { ShapeType } from '../types';

// Helper to draw centered text or emoji
const drawToCanvas = (ctx: CanvasRenderingContext2D, type: ShapeType) => {
  const size = CANVAS_SIZE;
  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Background clear
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);
  
  ctx.fillStyle = 'white'; // Draw in white to detect pixels

  const cx = size / 2;
  const cy = size / 2;

  switch (type) {
    case ShapeType.ChristmasTree:
      ctx.font = `${size * 0.8}px serif`;
      ctx.fillText('🎄', cx, cy + size * 0.05);
      break;
    case ShapeType.Santa:
      ctx.font = `${size * 0.8}px serif`;
      ctx.fillText('🎅', cx, cy + size * 0.05);
      break;
    case ShapeType.Heart:
      ctx.font = `${size * 0.8}px serif`;
      ctx.fillText('❤️', cx, cy + size * 0.05);
      break;
    case ShapeType.Flower:
      ctx.font = `${size * 0.8}px serif`;
      ctx.fillText('🌸', cx, cy + size * 0.05);
      break;
    case ShapeType.Saturn:
      ctx.font = `${size * 0.8}px serif`;
      ctx.fillText('🪐', cx, cy + size * 0.05);
      break;
    case ShapeType.ThumbsUp:
      ctx.font = `${size * 0.8}px serif`;
      ctx.fillText('👍', cx, cy + size * 0.05);
      break;
    case ShapeType.Text:
      ctx.font = `900 ${size * 0.25}px Inter, sans-serif`;
      ctx.fillText('Cc', cx, cy - size * 0.15);
      ctx.fillText('Design', cx, cy + size * 0.15);
      break;
  }
};

export const generateParticles = (type: ShapeType): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return positions;

  drawToCanvas(ctx, type);
  
  const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const data = imageData.data;
  const validPixels: number[] = [];

  // Scan for visible pixels
  for (let i = 0; i < data.length; i += 4) {
    // Check alpha and brightness
    if (data[i + 3] > 128 && (data[i] > 50 || data[i+1] > 50 || data[i+2] > 50)) {
      validPixels.push(i / 4);
    }
  }

  // If no pixels found (fallback), sphere
  if (validPixels.length === 0) {
     for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        positions[i * 3] = 2 * Math.cos(theta) * Math.sin(phi);
        positions[i * 3 + 1] = 2 * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = 2 * Math.cos(phi);
     }
     return positions;
  }

  // Distribute particles randomly among valid pixels
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const pixelIndex = validPixels[Math.floor(Math.random() * validPixels.length)];
    const x = (pixelIndex % CANVAS_SIZE);
    const y = Math.floor(pixelIndex / CANVAS_SIZE);
    
    // Normalize to -5 to 5 range and invert Y
    const nx = (x / CANVAS_SIZE - 0.5) * 10;
    const ny = -(y / CANVAS_SIZE - 0.5) * 10;
    
    // Add some depth variation (Z) to make it 3D-ish
    const nz = (Math.random() - 0.5) * 2; 

    positions[i * 3] = nx;
    positions[i * 3 + 1] = ny;
    positions[i * 3 + 2] = nz;
  }

  return positions;
};
