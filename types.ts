export interface ParticlePoint {
  x: number;
  y: number;
  z: number;
  color?: [number, number, number]; // r, g, b normalized
}

export enum ShapeType {
  ChristmasTree = 'TREE',
  Santa = 'SANTA',
  Heart = 'HEART',
  Flower = 'FLOWER',
  Saturn = 'SATURN',
  Text = 'TEXT',
  ThumbsUp = 'LIKE'
}

export interface AppState {
  currentShape: ShapeType;
  particleColor: string;
  isFullScreen: boolean;
  handDistance: number; // 0 to 1, derived from pinch/spread
  isHandDetected: boolean;
}

export interface HandLandmarkerResult {
  landmarks: { x: number; y: number; z: number }[][];
  worldLandmarks: { x: number; y: number; z: number }[][];
}