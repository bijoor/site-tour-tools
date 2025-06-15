import { Point, PathPoint } from '../types';

export const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculatePathLength = (points: PathPoint[]): number => {
  if (points.length < 2) return 0;
  
  let totalLength = 0;
  for (let i = 1; i < points.length; i++) {
    totalLength += calculateDistance(points[i - 1], points[i]);
  }
  return totalLength;
};

export const interpolatePoint = (p1: Point, p2: Point, t: number): Point => {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
};

export const getPointAtDistance = (points: PathPoint[], distance: number): Point | null => {
  if (points.length < 2) return null;
  
  let currentDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const segmentLength = calculateDistance(points[i - 1], points[i]);
    
    if (currentDistance + segmentLength >= distance) {
      const t = (distance - currentDistance) / segmentLength;
      return interpolatePoint(points[i - 1], points[i], t);
    }
    
    currentDistance += segmentLength;
  }
  
  return points[points.length - 1];
};

export const isPointNearPoint = (p1: Point, p2: Point, threshold: number): boolean => {
  return calculateDistance(p1, p2) <= threshold;
};

export const findNearestPOI = (
  point: Point,
  pois: Array<{ id: string; position: Point }>,
  maxDistance: number
): { id: string; position: Point } | null => {
  let nearest = null;
  let minDistance = maxDistance;
  
  for (const poi of pois) {
    const distance = calculateDistance(point, poi.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = poi;
    }
  }
  
  return nearest;
};

export const snapToGrid = (point: Point, gridSize: number): Point => {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

export const getBoundingBox = (points: Point[]): { 
  min: Point; 
  max: Point; 
  width: number; 
  height: number; 
} => {
  if (points.length === 0) {
    return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 }, width: 0, height: 0 };
  }
  
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  
  return {
    min: { x: minX, y: minY },
    max: { x: maxX, y: maxY },
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const normalizePoint = (point: Point, containerSize: { width: number; height: number }): Point => {
  return {
    x: point.x / containerSize.width,
    y: point.y / containerSize.height,
  };
};

export const denormalizePoint = (point: Point, containerSize: { width: number; height: number }): Point => {
  return {
    x: point.x * containerSize.width,
    y: point.y * containerSize.height,
  };
};