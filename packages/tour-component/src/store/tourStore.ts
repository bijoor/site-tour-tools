import { create } from 'zustand';
import { 
  TourData, 
  TourPlaybackState, 
  Point,
  calculatePathLength,
  getPointAtDistance
} from '@site-tour-tools/shared';

interface TourStore extends TourPlaybackState {
  tourData: TourData | null;
  currentPoint: Point | null;
  activePOI: string | null;
  totalDistance: number;
  elapsedDistance: number;
  currentSegmentIndex: number;
  segmentProgress: number;
  
  // Actions
  setTourData: (data: TourData) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  seekTo: (progress: number) => void;
  nextSegment: () => void;
  previousSegment: () => void;
  nextPOI: () => void;
  previousPOI: () => void;
  updatePosition: (progress: number) => void;
  updateSegmentPosition: (segmentProgress: number) => void;
  completeCurrentSegment: () => void;
  visitPOI: (poiId: string) => void;
}

export const useTourStore = create<TourStore>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentSegment: 0,
  currentPosition: 0,
  progress: 0,
  speed: 1,
  visitedPOIs: [],
  tourData: null,
  currentPoint: null,
  activePOI: null,
  totalDistance: 0,
  elapsedDistance: 0,
  currentSegmentIndex: 0,
  segmentProgress: 0,

  // Actions
  setTourData: (data) => {
    const totalDistance = data.paths.reduce((sum, path) => 
      sum + calculatePathLength(path.points), 0
    );
    
    // Set initial position to start of first path
    const initialPoint = data.paths.length > 0 ? data.paths[0].points[0] : null;
    
    set({ 
      tourData: data,
      totalDistance,
      currentSegment: 0,
      currentPosition: 0,
      progress: 0,
      elapsedDistance: 0,
      visitedPOIs: [],
      activePOI: null,
      isPlaying: false,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      currentPoint: initialPoint,
    });
  },

  play: () => {
    console.log('🎬 TOUR STORE: play() called');
    set({ isPlaying: true });
  },
  
  pause: () => set({ isPlaying: false }),
  
  stop: () => {
    const state = get();
    set({ 
      isPlaying: false,
      currentSegment: 0,
      currentPosition: 0,
      progress: 0,
      elapsedDistance: 0,
      visitedPOIs: [],
      activePOI: null,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      currentPoint: state.tourData?.paths[0]?.points[0] || null,
    });
  },
  
  nextSegment: () => {
    const state = get();
    if (!state.tourData || state.currentSegmentIndex >= state.tourData.paths.length - 1) {
      console.log('⏭️ TOUR STORE: nextSegment() - no more segments');
      return;
    }
    
    const nextIndex = state.currentSegmentIndex + 1;
    const nextPath = state.tourData.paths[nextIndex];
    
    console.log('⏭️ TOUR STORE: nextSegment() - advancing from segment', state.currentSegmentIndex, 'to', nextIndex);
    
    // Calculate overall progress for the new segment start
    const totalSegments = state.tourData.paths.length;
    const overallProgress = nextIndex / totalSegments;
    
    set({
      currentSegmentIndex: nextIndex,
      segmentProgress: 0,
      currentPoint: nextPath.points[0],
      isPlaying: false, // Stop at the beginning of new segment
      progress: overallProgress, // Update overall progress
    });
  },
  
  previousSegment: () => {
    const state = get();
    if (!state.tourData || state.currentSegmentIndex <= 0) return;
    
    const prevIndex = state.currentSegmentIndex - 1;
    const prevPath = state.tourData.paths[prevIndex];
    
    // Calculate overall progress for the previous segment start
    const totalSegments = state.tourData.paths.length;
    const overallProgress = prevIndex / totalSegments;
    
    set({
      currentSegmentIndex: prevIndex,
      segmentProgress: 0,
      currentPoint: prevPath.points[0],
      isPlaying: false, // Stop at the beginning of segment
      progress: overallProgress, // Update overall progress
    });
  },
  
  setSpeed: (speed) => set({ speed: Math.max(0.1, Math.min(3, speed)) }),
  
  seekTo: (progress) => {
    const state = get();
    if (!state.tourData || state.tourData.paths.length === 0) return;
    
    const targetDistance = state.totalDistance * progress;
    let accumulatedDistance = 0;
    let targetSegment = 0;
    let targetPosition = 0;
    
    // Find which path segment the progress falls into
    for (let i = 0; i < state.tourData.paths.length; i++) {
      const pathLength = calculatePathLength(state.tourData.paths[i].points);
      
      if (accumulatedDistance + pathLength >= targetDistance) {
        targetSegment = i;
        targetPosition = (targetDistance - accumulatedDistance) / pathLength;
        break;
      }
      
      accumulatedDistance += pathLength;
    }
    
    // Get the actual position on the path
    const path = state.tourData.paths[targetSegment];
    const point = getPointAtDistance(
      path.points, 
      targetPosition * calculatePathLength(path.points)
    );
    
    set({
      progress,
      currentSegment: targetSegment,
      currentPosition: targetPosition,
      elapsedDistance: targetDistance,
      currentPoint: point,
    });
  },
  
  nextPOI: () => {
    const state = get();
    if (!state.tourData) return;
    
    const unvisitedPOIs = state.tourData.pois.filter(
      poi => !state.visitedPOIs.includes(poi.id)
    );
    
    if (unvisitedPOIs.length > 0) {
      // Find the next POI along the path
      // This is a simplified implementation - in practice, you'd want to
      // calculate the actual path to the next POI
      const nextPOI = unvisitedPOIs[0];
      get().visitPOI(nextPOI.id);
    }
  },
  
  previousPOI: () => {
    const state = get();
    if (state.visitedPOIs.length > 0) {
      const lastVisited = state.visitedPOIs[state.visitedPOIs.length - 1];
      set({
        visitedPOIs: state.visitedPOIs.slice(0, -1),
        activePOI: lastVisited,
      });
    }
  },
  
  updateSegmentPosition: (segmentProgress) => {
    const state = get();
    if (!state.tourData || state.tourData.paths.length === 0) return;
    
    const currentPath = state.tourData.paths[state.currentSegmentIndex];
    if (!currentPath) return;
    
    // Log progress updates (throttled to avoid spam)
    if (Math.floor(segmentProgress * 10) !== Math.floor(state.segmentProgress * 10)) {
      console.log('📍 TOUR STORE: updateSegmentPosition() - segment', state.currentSegmentIndex, 'progress:', Math.round(segmentProgress * 100) + '%');
    }
    
    const pathLength = calculatePathLength(currentPath.points);
    const distanceInSegment = pathLength * segmentProgress;
    const currentPoint = getPointAtDistance(currentPath.points, distanceInSegment);
    
    // Check for POI visits
    if (currentPoint && state.tourData) {
      const nearbyPOI = state.tourData.pois.find(poi => {
        const distance = Math.sqrt(
          Math.pow(poi.position.x - currentPoint!.x, 2) +
          Math.pow(poi.position.y - currentPoint!.y, 2)
        );
        return distance < 20; // Within 20 pixels
      });
      
      if (nearbyPOI && !state.visitedPOIs.includes(nearbyPOI.id)) {
        get().visitPOI(nearbyPOI.id);
      }
    }
    
    // Round coordinates to prevent micro-movements
    const stabilizedPoint = currentPoint ? {
      x: Math.round(currentPoint.x * 10) / 10,
      y: Math.round(currentPoint.y * 10) / 10
    } : null;

    set({
      segmentProgress,
      currentPoint: stabilizedPoint,
    });
  },

  updatePosition: (progress) => {
    const state = get();
    if (!state.tourData || state.tourData.paths.length === 0) return;
    
    const targetDistance = state.totalDistance * progress;
    let accumulatedDistance = 0;
    let currentSegment = 0;
    let segmentProgress = 0;
    let currentPoint: Point | null = null;
    
    // Find current position along the path
    for (let i = 0; i < state.tourData.paths.length; i++) {
      const path = state.tourData.paths[i];
      const pathLength = calculatePathLength(path.points);
      
      if (accumulatedDistance + pathLength >= targetDistance) {
        currentSegment = i;
        const distanceInSegment = targetDistance - accumulatedDistance;
        segmentProgress = distanceInSegment / pathLength;
        currentPoint = getPointAtDistance(path.points, distanceInSegment);
        break;
      }
      
      accumulatedDistance += pathLength;
    }
    
    // Check for POI visits
    if (currentPoint && state.tourData) {
      const nearbyPOI = state.tourData.pois.find(poi => {
        const distance = Math.sqrt(
          Math.pow(poi.position.x - currentPoint!.x, 2) +
          Math.pow(poi.position.y - currentPoint!.y, 2)
        );
        return distance < 20; // Within 20 pixels
      });
      
      if (nearbyPOI && !state.visitedPOIs.includes(nearbyPOI.id)) {
        get().visitPOI(nearbyPOI.id);
      }
    }
    
    // Round coordinates to prevent micro-movements
    const stabilizedPoint = currentPoint ? {
      x: Math.round(currentPoint.x * 10) / 10,
      y: Math.round(currentPoint.y * 10) / 10
    } : null;

    set({
      progress,
      currentSegment,
      currentPosition: segmentProgress,
      elapsedDistance: targetDistance,
      currentPoint: stabilizedPoint,
      currentSegmentIndex: currentSegment,
      segmentProgress,
    });
  },

  completeCurrentSegment: () => {
    const state = get();
    if (!state.tourData) return;
    
    const currentPath = state.tourData.paths[state.currentSegmentIndex];
    if (!currentPath) return;
    
    console.log('✅ TOUR STORE: completeCurrentSegment() - segment', state.currentSegmentIndex, 'completed');
    
    // Check if this segment has an associated end POI
    if (currentPath.endPOI && !state.visitedPOIs.includes(currentPath.endPOI)) {
      console.log('✅ TOUR STORE: Segment completed - visiting POI:', currentPath.endPOI);
      get().visitPOI(currentPath.endPOI);
    }
  },
  
  visitPOI: (poiId) => {
    const state = get();
    if (!state.visitedPOIs.includes(poiId)) {
      set({
        visitedPOIs: [...state.visitedPOIs, poiId],
        activePOI: poiId,
      });
    }
  },
}));