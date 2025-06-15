import { TourTheme, TourSettings } from '../types';

export const DEFAULT_SNAP_DISTANCE = 20;
export const DEFAULT_POI_SIZE = 12;
export const DEFAULT_PATH_WIDTH = 3;
export const DEFAULT_ANIMATION_SPEED = 1;
export const DEFAULT_PAUSE_AT_POI = 2000;

export const DEFAULT_THEME: TourTheme = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  background: '#ffffff',
  text: '#1f2937',
  accent: '#f59e0b',
  poi: {
    color: '#ef4444',
    size: DEFAULT_POI_SIZE,
    hoverColor: '#dc2626',
  },
  path: {
    color: '#3b82f6',
    width: DEFAULT_PATH_WIDTH,
    activeColor: '#1d4ed8',
  },
};

export const DEFAULT_TOUR_SETTINGS: TourSettings = {
  animationSpeed: DEFAULT_ANIMATION_SPEED,
  pauseAtPOI: DEFAULT_PAUSE_AT_POI,
  showPOILabels: true,
  autoStart: false,
  loop: false,
  theme: DEFAULT_THEME,
};

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'image/webp',
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ZOOM = 5;
export const MIN_ZOOM = 0.1;

export const DRAWING_MODES = {
  POI: 'poi' as const,
  PATH: 'path' as const,
  SELECT: 'select' as const,
};

export const PATH_STYLES = {
  SOLID: 'solid' as const,
  DASHED: 'dashed' as const,
  DOTTED: 'dotted' as const,
};

export const TOUR_EVENTS = {
  POI_ADDED: 'poi-added' as const,
  POI_UPDATED: 'poi-updated' as const,
  POI_DELETED: 'poi-deleted' as const,
  PATH_STARTED: 'path-started' as const,
  PATH_POINT_ADDED: 'path-point-added' as const,
  PATH_COMPLETED: 'path-completed' as const,
  PATH_DELETED: 'path-deleted' as const,
  TOUR_STARTED: 'tour-started' as const,
  TOUR_PAUSED: 'tour-paused' as const,
  TOUR_COMPLETED: 'tour-completed' as const,
  POI_VISITED: 'poi-visited' as const,
};

export const KEYBOARD_SHORTCUTS = {
  DELETE: 'Delete',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ENTER: 'Enter',
  CTRL_Z: 'z',
  CTRL_Y: 'y',
  CTRL_S: 's',
  CTRL_O: 'o',
};

export const MOBILE_BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
};