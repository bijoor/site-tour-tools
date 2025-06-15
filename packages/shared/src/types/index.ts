export interface Point {
  x: number;
  y: number;
}

export interface POI {
  id: string;
  position: Point;
  label: string;
  description?: string;
  metadata?: Record<string, any>;
  isConnected?: boolean;
}

export interface PathPoint extends Point {
  id: string;
  connectedPOI?: string;
  timestamp?: number;
}

export interface PathSegment {
  id: string;
  points: PathPoint[];
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface TourData {
  id: string;
  name: string;
  description?: string;
  backgroundImage: {
    url: string;
    width: number;
    height: number;
  };
  pois: POI[];
  paths: PathSegment[];
  settings: TourSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TourSettings {
  animationSpeed: number;
  pauseAtPOI: number;
  showPOILabels: boolean;
  autoStart: boolean;
  loop: boolean;
  theme: TourTheme;
}

export interface TourTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  poi: {
    color: string;
    size: number;
    hoverColor: string;
  };
  path: {
    color: string;
    width: number;
    activeColor: string;
  };
}

export interface TourPlaybackState {
  isPlaying: boolean;
  currentSegment: number;
  currentPosition: number;
  progress: number;
  speed: number;
  visitedPOIs: string[];
}

export interface DrawingToolState {
  mode: 'poi' | 'path' | 'select';
  selectedPOI?: string;
  selectedPath?: string;
  isDrawing: boolean;
  snapDistance: number;
  zoom: number;
  pan: Point;
}

export interface ExportOptions {
  format: 'json' | 'svg';
  includeBackground: boolean;
  includeMetadata: boolean;
  compression?: boolean;
}

export type EventType = 
  | 'poi-added'
  | 'poi-updated'
  | 'poi-deleted'
  | 'path-started'
  | 'path-point-added'
  | 'path-completed'
  | 'path-deleted'
  | 'tour-started'
  | 'tour-paused'
  | 'tour-completed'
  | 'poi-visited';

export interface TourEvent {
  type: EventType;
  timestamp: number;
  data: any;
}