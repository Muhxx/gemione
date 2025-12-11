import { ShapeType } from "./types";

export const PARTICLE_COUNT = 4000;
export const CANVAS_SIZE = 128; // Resolution for scanning shapes
export const CAMERA_FOV = 45;

export const SHAPE_CONFIGS = [
  { id: ShapeType.ChristmasTree, label: 'Tree', icon: '🎄', color: '#2ecc71' },
  { id: ShapeType.Santa, label: 'Santa', icon: '🎅', color: '#e74c3c' },
  { id: ShapeType.Heart, label: 'Heart', icon: '❤️', color: '#e91e63' },
  { id: ShapeType.Flower, label: 'Flower', icon: '🌸', color: '#d580ff' },
  { id: ShapeType.Saturn, label: 'Saturn', icon: '🪐', color: '#f1c40f' },
  { id: ShapeType.Text, label: 'CcDesign', icon: 'Cc', color: '#ffffff' },
  { id: ShapeType.ThumbsUp, label: 'Like', icon: '👍', color: '#3498db' },
];

export const DEFAULT_COLOR = '#ffffff';
