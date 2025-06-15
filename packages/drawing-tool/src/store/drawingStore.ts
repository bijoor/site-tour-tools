import { create } from 'zustand';
import { 
  TourData, 
  POI, 
  PathSegment, 
  PathPoint, 
  Point, 
  DrawingToolState,
  DEFAULT_TOUR_SETTINGS,
  generateTourId,
  generatePOIId,
  generatePathId,
  generatePointId,
  DEFAULT_SNAP_DISTANCE
} from '@site-tour-tools/shared';

interface DrawingStore extends DrawingToolState {
  tourData: TourData | null;
  currentPath: PathPoint[] | null;
  backgroundImage: string | null;
  backgroundDimensions: { width: number; height: number } | null;
  showPOIAssociationDialog: boolean;
  pendingPOI: { position: Point } | null;
  
  // Actions
  setMode: (mode: 'poi' | 'path' | 'select') => void;
  setTourData: (data: TourData | null) => void;
  setBackgroundImage: (url: string | null, dimensions: { width: number; height: number } | null) => void;
  
  // POI actions
  startPOICreation: (position: Point) => void;
  createPOI: (label: string, description?: string, showLabel?: boolean) => void;
  cancelPOICreation: () => void;
  addPOI: (position: Point, label: string) => void;
  updatePOI: (id: string, updates: Partial<POI>) => void;
  deletePOI: (id: string) => void;
  selectPOI: (id: string | undefined) => void;
  
  // Path actions
  startPath: (point: Point) => void;
  addPathPoint: (point: Point, connectedPOI?: string) => void;
  completePath: () => void;
  completePathWithPOI: (endPOI?: string) => void;
  cancelPath: () => void;
  updatePath: (id: string, updates: Partial<PathSegment>) => void;
  deletePath: (id: string) => void;
  selectPath: (id: string | undefined) => void;
  
  // POI Association Dialog
  showPOIDialog: () => void;
  hidePOIDialog: () => void;
  
  // Canvas actions
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  
  // Utility functions
  createNewTour: (name: string) => void;
  exportTour: () => string;
  importTour: (data: string) => void;
}

export const useDrawingStore = create<DrawingStore>((set, get) => ({
  // Initial state
  mode: 'select',
  selectedPOI: undefined,
  selectedPath: undefined,
  isDrawing: false,
  snapDistance: DEFAULT_SNAP_DISTANCE,
  zoom: 1,
  pan: { x: 0, y: 0 },
  tourData: null,
  currentPath: null,
  backgroundImage: null,
  backgroundDimensions: null,
  showPOIAssociationDialog: false,
  pendingPOI: null,

  // Actions
  setMode: (mode) => set({ mode, selectedPOI: undefined, selectedPath: undefined }),
  
  setTourData: (data) => set({ 
    tourData: data,
    // Reset state when clearing tour data
    ...(data === null && {
      selectedPOI: undefined,
      selectedPath: undefined,
      isDrawing: false,
      currentPath: null,
      mode: 'select'
    })
  }),
  
  setBackgroundImage: (url, dimensions) => set({ 
    backgroundImage: url, 
    backgroundDimensions: dimensions 
  }),
  
  // POI actions
  startPOICreation: (position) => {
    set({ 
      pendingPOI: { position },
      selectedPOI: 'pending' // Use special ID to trigger POI edit popup
    });
  },

  createPOI: (label, description, showLabel = true) => {
    const state = get();
    if (!state.tourData || !state.pendingPOI) return;
    
    const newPOI: POI = {
      id: generatePOIId(),
      position: state.pendingPOI.position,
      label,
      description,
      showLabel,
      isConnected: false,
    };
    
    const updatedTourData = {
      ...state.tourData,
      pois: [...state.tourData.pois, newPOI],
      updatedAt: new Date().toISOString(),
    };
    
    set({ 
      tourData: updatedTourData,
      pendingPOI: null,
      selectedPOI: newPOI.id // Select the newly created POI
    });
  },

  cancelPOICreation: () => {
    set({ 
      pendingPOI: null,
      selectedPOI: undefined
    });
  },

  addPOI: (position, label) => {
    const state = get();
    if (!state.tourData) return;
    
    const newPOI: POI = {
      id: generatePOIId(),
      position,
      label,
      isConnected: false,
    };
    
    const updatedTourData = {
      ...state.tourData,
      pois: [...state.tourData.pois, newPOI],
      updatedAt: new Date().toISOString(),
    };
    
    set({ tourData: updatedTourData });
  },
  
  updatePOI: (id, updates) => {
    const state = get();
    if (!state.tourData) return;
    
    const updatedTourData = {
      ...state.tourData,
      pois: state.tourData.pois.map(poi => 
        poi.id === id ? { ...poi, ...updates } : poi
      ),
      updatedAt: new Date().toISOString(),
    };
    
    set({ tourData: updatedTourData });
  },
  
  deletePOI: (id) => {
    const state = get();
    if (!state.tourData) return;
    
    const updatedTourData = {
      ...state.tourData,
      pois: state.tourData.pois.filter(poi => poi.id !== id),
      paths: state.tourData.paths.map(path => ({
        ...path,
        points: path.points.map(point => 
          point.connectedPOI === id 
            ? { ...point, connectedPOI: undefined }
            : point
        ),
      })),
      updatedAt: new Date().toISOString(),
    };
    
    set({ 
      tourData: updatedTourData,
      selectedPOI: state.selectedPOI === id ? undefined : state.selectedPOI
    });
  },
  
  selectPOI: (id) => {
    console.log('Store: selectPOI called with:', id);
    set({ selectedPOI: id, selectedPath: undefined });
  },
  
  // Path actions
  startPath: (point) => {
    const startPoint: PathPoint = {
      id: generatePointId(),
      x: point.x,
      y: point.y,
      timestamp: Date.now(),
    };
    
    set({ 
      isDrawing: true, 
      currentPath: [startPoint],
      mode: 'path'
    });
  },
  
  addPathPoint: (point, connectedPOI) => {
    const state = get();
    if (!state.currentPath) return;
    
    const newPoint: PathPoint = {
      id: generatePointId(),
      x: point.x,
      y: point.y,
      connectedPOI,
      timestamp: Date.now(),
    };
    
    set({ 
      currentPath: [...state.currentPath, newPoint]
    });
  },
  
  completePath: () => {
    const state = get();
    if (!state.currentPath || !state.tourData || state.currentPath.length < 2) return;
    
    // Show POI association dialog
    set({ showPOIAssociationDialog: true });
  },

  completePathWithPOI: (endPOI) => {
    const state = get();
    if (!state.currentPath || !state.tourData || state.currentPath.length < 2) return;
    
    const newPath: PathSegment = {
      id: generatePathId(),
      points: state.currentPath,
      endPOI, // Add POI association
      color: state.tourData.settings.theme.path.color,
      width: state.tourData.settings.theme.path.width,
      style: 'solid',
    };
    
    // Update connected POIs
    const connectedPOIIds = state.currentPath
      .filter(point => point.connectedPOI)
      .map(point => point.connectedPOI!);
    
    const updatedTourData = {
      ...state.tourData,
      paths: [...state.tourData.paths, newPath],
      pois: state.tourData.pois.map(poi => 
        connectedPOIIds.includes(poi.id) 
          ? { ...poi, isConnected: true }
          : poi
      ),
      updatedAt: new Date().toISOString(),
    };
    
    set({ 
      tourData: updatedTourData,
      currentPath: null,
      isDrawing: false,
      showPOIAssociationDialog: false,
    });
  },
  
  cancelPath: () => set({ 
    currentPath: null, 
    isDrawing: false 
  }),

  updatePath: (id, updates) => {
    const state = get();
    if (!state.tourData) return;
    
    const updatedTourData = {
      ...state.tourData,
      paths: state.tourData.paths.map(path => 
        path.id === id ? { ...path, ...updates } : path
      ),
      updatedAt: new Date().toISOString(),
    };
    
    set({ tourData: updatedTourData });
  },
  
  deletePath: (id) => {
    const state = get();
    if (!state.tourData) return;
    
    const pathToDelete = state.tourData.paths.find(path => path.id === id);
    if (!pathToDelete) return;
    
    // Get POIs that were connected to this path
    const connectedPOIIds = pathToDelete.points
      .filter(point => point.connectedPOI)
      .map(point => point.connectedPOI!);
    
    // Check if these POIs are connected to other paths
    const remainingPaths = state.tourData.paths.filter(path => path.id !== id);
    const stillConnectedPOIIds = new Set(
      remainingPaths.flatMap(path => 
        path.points
          .filter(point => point.connectedPOI)
          .map(point => point.connectedPOI!)
      )
    );
    
    const updatedTourData = {
      ...state.tourData,
      paths: remainingPaths,
      pois: state.tourData.pois.map(poi => 
        connectedPOIIds.includes(poi.id) && !stillConnectedPOIIds.has(poi.id)
          ? { ...poi, isConnected: false }
          : poi
      ),
      updatedAt: new Date().toISOString(),
    };
    
    set({ 
      tourData: updatedTourData,
      selectedPath: state.selectedPath === id ? undefined : state.selectedPath
    });
  },
  
  selectPath: (id) => set({ selectedPath: id, selectedPOI: undefined }),
  
  // POI Association Dialog
  showPOIDialog: () => set({ showPOIAssociationDialog: true }),
  hidePOIDialog: () => set({ showPOIAssociationDialog: false }),
  
  // Canvas actions
  setZoom: (zoom) => {
    console.log('Store: setZoom called with:', zoom);
    set({ zoom });
  },
  setPan: (pan) => {
    console.log('Store: setPan called with:', pan);
    set({ pan });
  },
  
  // Utility functions
  createNewTour: (name) => {
    const state = get();
    if (!state.backgroundDimensions) return;
    
    const newTour: TourData = {
      id: generateTourId(),
      name,
      backgroundImage: {
        url: state.backgroundImage || '',
        width: state.backgroundDimensions.width,
        height: state.backgroundDimensions.height,
      },
      pois: [],
      paths: [],
      settings: DEFAULT_TOUR_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set({ tourData: newTour });
  },
  
  exportTour: () => {
    const state = get();
    if (!state.tourData) return '';
    
    return JSON.stringify(state.tourData, null, 2);
  },
  
  importTour: (data) => {
    try {
      const tourData = JSON.parse(data) as TourData;
      
      // Reset drawing state
      set({ 
        tourData,
        backgroundImage: tourData.backgroundImage.url,
        backgroundDimensions: {
          width: tourData.backgroundImage.width,
          height: tourData.backgroundImage.height,
        },
        // Reset drawing state
        mode: 'select',
        selectedPOI: undefined,
        selectedPath: undefined,
        isDrawing: false,
        currentPath: null,
        // Reset view state
        zoom: 1,
        pan: { x: 0, y: 0 }
      });
      
      console.log('Tour imported successfully:', {
        name: tourData.name,
        pois: tourData.pois.length,
        paths: tourData.paths.length,
        backgroundSize: `${tourData.backgroundImage.width}x${tourData.backgroundImage.height}`
      });
    } catch (error) {
      console.error('Failed to import tour data:', error);
      throw error; // Re-throw so the UI can handle it
    }
  },
}));