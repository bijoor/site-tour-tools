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
  availableDestinations: string[];
  selectedDestination: string | null;
  availablePaths: string[];
  selectedPath: string | null;
  isPathSelectionMode: boolean;
  isReverseDirection: boolean;
  
  // Actions
  setTourData: (data: TourData) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  seekTo: (progress: number) => void;
  nextSegment: () => void;
  advanceToNextSegment: () => boolean;
  previousSegment: () => void;
  nextPOI: () => void;
  previousPOI: () => void;
  updatePosition: (progress: number) => void;
  updateSegmentPosition: (segmentProgress: number) => void;
  completeCurrentSegment: () => void;
  visitPOI: (poiId: string) => void;
  getAvailableDestinations: () => string[];
  selectDestination: (poiId: string) => void;
  navigateToDestination: () => void;
  getAvailablePaths: () => string[];
  selectPath: (pathId: string) => void;
  navigateToPath: () => void;
  determineNextAction: () => boolean;
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
  availableDestinations: [],
  selectedDestination: null,
  availablePaths: [],
  selectedPath: null,
  isPathSelectionMode: false,
  isReverseDirection: false,

  // Actions
  setTourData: (data) => {
    console.log('🎯 TOUR STORE: setTourData() - received data:', {
      pathCount: data.paths.length,
      poiCount: data.pois.length,
      firstFewPaths: data.paths.slice(0, 3).map(p => ({
        id: p.id,
        startPOI: p.startPOI,
        endPOI: p.endPOI
      }))
    });
    
    const totalDistance = data.paths.reduce((sum, path) => 
      sum + calculatePathLength(path.points), 0
    );
    
    // Set initial position to start of first path
    const initialPoint = data.paths.length > 0 ? data.paths[0].points[0] : null;
    
    // Check if first path has a startPOI to auto-visit
    const firstPath = data.paths.length > 0 ? data.paths[0] : null;
    const initialPOI = firstPath?.startPOI || null;
    const initialVisitedPOIs = initialPOI ? [initialPOI] : [];
    
    console.log('🎯 TOUR STORE: setTourData() - initializing tour:', {
      pathCount: data.paths.length,
      poiCount: data.pois.length,
      firstPathStartPOI: firstPath?.startPOI,
      initialPOI
    });
    
    set({ 
      tourData: data,
      totalDistance,
      currentSegment: 0,
      currentPosition: 0,
      progress: 0,
      elapsedDistance: 0,
      visitedPOIs: initialVisitedPOIs,
      activePOI: initialPOI,
      isPlaying: false,
      currentSegmentIndex: 0,
      segmentProgress: 0,
      currentPoint: initialPoint,
      availableDestinations: [],
      selectedDestination: null,
    });
    
    // If we have an initial POI, calculate available destinations
    if (initialPOI) {
      const availableDestinations = get().getAvailableDestinations();
      console.log('🎯 TOUR STORE: Initial available destinations:', availableDestinations);
      set({ 
        availableDestinations,
        selectedDestination: availableDestinations.length > 0 ? availableDestinations[0] : null 
      });
    }
  },

  play: () => {
    console.log('🎬 TOUR STORE: play() called');
    console.trace('🎬 TOUR STORE: play() call stack');
    
    const state = get();
    
    // If in path selection mode, navigate to selected path instead of just playing
    if (state.isPathSelectionMode && state.selectedPath) {
      console.log('🚀 TOUR STORE: In path selection mode - navigating to selected path');
      get().navigateToPath();
    } else {
      console.log('🚀 TOUR STORE: Normal play - setting isPlaying true');
      set({ isPlaying: true });
    }
  },
  
  pause: () => {
    console.log('⏸️ TOUR STORE: pause() called');
    console.trace('⏸️ TOUR STORE: pause() call stack');
    set({ isPlaying: false });
  },
  
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
      availableDestinations: [],
      selectedDestination: null,
    });
  },
  
  nextSegment: () => {
    const state = get();
    if (!state.tourData) {
      console.log('⏭️ TOUR STORE: nextSegment() - no tour data');
      return;
    }
    
    // Complete current segment first to get to the end POI
    get().completeCurrentSegment();
    
    // Then trigger path selection to see available next paths
    // If only one path is available, auto-select it
    const updatedState = get();
    if (updatedState.isPathSelectionMode && updatedState.availablePaths.length === 1) {
      console.log('⏭️ TOUR STORE: nextSegment() - auto-selecting single available path');
      set({ selectedPath: updatedState.availablePaths[0] });
      get().navigateToPath();
    } else if (updatedState.isPathSelectionMode && updatedState.availablePaths.length > 1) {
      console.log('⏭️ TOUR STORE: nextSegment() - multiple paths available, user must choose');
      // User will need to manually select a path
    } else {
      console.log('⏭️ TOUR STORE: nextSegment() - no more available paths');
    }
  },

  // Internal method for automatic progression during continuous playback
  advanceToNextSegment: () => {
    const state = get();
    if (!state.tourData || state.currentSegmentIndex >= state.tourData.paths.length - 1) {
      console.log('⏭️ TOUR STORE: advanceToNextSegment() - no more segments');
      return false; // No more segments
    }
    
    const nextIndex = state.currentSegmentIndex + 1;
    const nextPath = state.tourData.paths[nextIndex];
    
    console.log('⏭️ TOUR STORE: advanceToNextSegment() - auto-advancing from segment', state.currentSegmentIndex, 'to', nextIndex);
    
    // Calculate overall progress for the new segment start
    const totalSegments = state.tourData.paths.length;
    const overallProgress = nextIndex / totalSegments;
    
    set({
      currentSegmentIndex: nextIndex,
      segmentProgress: 0,
      currentPoint: nextPath.points[0],
      // Keep isPlaying state unchanged for continuous playback
      progress: overallProgress, // Update overall progress
    });
    
    return true; // Successfully advanced
  },
  
  previousSegment: () => {
    const state = get();
    if (!state.tourData || state.visitedPOIs.length === 0) {
      console.log('⏮️ TOUR STORE: previousSegment() - no visited POIs to go back to');
      return;
    }
    
    // Get the previous POI from visited list
    const previousPOI = state.visitedPOIs[state.visitedPOIs.length - 1];
    
    console.log('⏮️ TOUR STORE: previousSegment() - going back to POI:', previousPOI);
    
    // Remove the last visited POI and set it as active
    const newVisitedPOIs = state.visitedPOIs.slice(0, -1);
    
    // Find paths that connect to this POI
    const forwardPaths = state.tourData.paths.filter(path => 
      path.startPOI === previousPOI
    );
    
    const reversePaths = state.tourData.paths.filter(path => {
      if (path.endPOI !== previousPOI) return false;
      // Only include reverse paths if their startPOI hasn't been visited yet
      if (path.startPOI && newVisitedPOIs.includes(path.startPOI)) {
        return false;
      }
      return true;
    });
    
    const availablePaths = [...forwardPaths, ...reversePaths];
    
    // Find the POI position to set current point
    const poi = state.tourData.pois.find(p => p.id === previousPOI);
    
    set({
      visitedPOIs: newVisitedPOIs,
      activePOI: previousPOI,
      currentPoint: poi ? { x: poi.position.x, y: poi.position.y } : null,
      isPlaying: false,
      segmentProgress: 0,
      availablePaths: availablePaths.map(p => p.id),
      selectedPath: availablePaths.length > 0 ? availablePaths[0].id : null,
      isPathSelectionMode: availablePaths.length > 0,
    });
    
    console.log('⏮️ TOUR STORE: previousSegment() - set up path selection from POI', previousPOI, 'with', availablePaths.length, 'available paths');
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
    
    const pathLength = calculatePathLength(currentPath.points);
    
    // Handle reverse direction
    let effectiveProgress = segmentProgress;
    if (state.isReverseDirection) {
      // For reverse paths, invert the progress (1 - progress)
      effectiveProgress = 1 - segmentProgress;
    }
    
    const distanceInSegment = pathLength * effectiveProgress;
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
    
    console.log('✅ TOUR STORE: completeCurrentSegment() - segment', state.currentSegmentIndex, 'completed', state.isReverseDirection ? '(REVERSE)' : '(FORWARD)');
    
    // For reverse paths, we visit the startPOI, for forward paths we visit the endPOI
    const targetPOI = state.isReverseDirection ? currentPath.startPOI : currentPath.endPOI;
    
    if (targetPOI && !state.visitedPOIs.includes(targetPOI)) {
      console.log('✅ TOUR STORE: Segment completed - visiting POI:', targetPOI);
      get().visitPOI(targetPOI);
    }
    
    // Reset reverse direction flag for next path selection
    set({ isReverseDirection: false });
    
    // Determine next action based on new logic
    get().determineNextAction();
  },

  determineNextAction: () => {
    const state = get();
    if (!state.tourData) {
      console.log('❌ TOUR STORE: determineNextAction() - no tour data');
      return false;
    }
    
    const currentPath = state.tourData.paths[state.currentSegmentIndex];
    if (!currentPath) {
      console.log('❌ TOUR STORE: determineNextAction() - no current path');
      return false;
    }
    
    // Determine the actual POI we've arrived at based on direction
    // NOTE: The isReverseDirection flag was reset in completeCurrentSegment, but we need to check
    // if this was a reverse path by looking at what POI was just visited
    const lastVisitedPOI = state.visitedPOIs[state.visitedPOIs.length - 1];
    
    // Use the last visited POI as our current location for finding next paths
    const currentLocationPOI = lastVisitedPOI || currentPath.endPOI;
    
    console.log('🤔 TOUR STORE: determineNextAction() - analyzing path completion', {
      currentSegmentIndex: state.currentSegmentIndex,
      pathId: currentPath.id,
      pathStartPOI: currentPath.startPOI,
      pathEndPOI: currentPath.endPOI,
      lastVisitedPOI,
      currentLocationPOI,
      totalPaths: state.tourData.paths.length,
      currentlyPlaying: state.isPlaying
    });
    
    // Case 1: No current location POI - prepare next path but don't auto-advance
    if (!currentLocationPOI) {
      console.log('📍 TOUR STORE: No endPOI - preparing next path selection');
      
      // Check if there's a next path
      const nextIndex = state.currentSegmentIndex + 1;
      if (nextIndex < state.tourData.paths.length) {
        console.log('📍 TOUR STORE: Next path available - entering selection mode');
        set({
          availablePaths: [state.tourData.paths[nextIndex].id],
          selectedPath: state.tourData.paths[nextIndex].id,
          isPathSelectionMode: true,
        });
        return false; // Don't auto-continue
      } else {
        console.log('🏁 TOUR STORE: No more paths - tour completed');
        return false; // End tour
      }
    }
    
    // Case 2 & 3: Has current location POI - find paths that connect to this POI
    const endPOI = currentLocationPOI;
    
    // Debug: Show all paths and their startPOI values
    console.log('🔍 TOUR STORE: All paths in tour:', state.tourData.paths.map(path => ({
      id: path.id,
      startPOI: path.startPOI,
      endPOI: path.endPOI
    })));
    
    // Find forward paths (paths that start from current endPOI)
    const forwardPaths = state.tourData.paths.filter(path => 
      path.startPOI === endPOI && path.id !== currentPath.id
    );
    
    // Find reverse paths (paths that end at current endPOI and whose startPOI is unvisited)
    const reversePaths = state.tourData.paths.filter(path => {
      if (path.endPOI !== endPOI || path.id === currentPath.id) return false;
      
      // Only include reverse paths if their startPOI hasn't been visited yet
      if (path.startPOI && state.visitedPOIs.includes(path.startPOI)) {
        return false;
      }
      
      return true;
    });
    
    // Combine both forward and reverse paths
    const availablePaths = [...forwardPaths, ...reversePaths];
    
    console.log('🛤️ TOUR STORE: Found paths from POI', endPOI, ':', {
      forwardPaths: forwardPaths.map(p => ({id: p.id, startPOI: p.startPOI, direction: 'forward'})),
      reversePaths: reversePaths.map(p => ({id: p.id, endPOI: p.endPOI, startPOI: p.startPOI, direction: 'reverse'})),
      totalAvailable: availablePaths.length,
      currentPathId: currentPath.id,
      visitedPOIs: state.visitedPOIs
    });
    
    // Case 2: No paths available from this POI - tour ends here
    if (availablePaths.length === 0) {
      console.log('🏁 TOUR STORE: No paths available from POI', endPOI, '- tour completed');
      
      // Tour ends here - no more valid paths
      set({
        availablePaths: [],
        selectedPath: null,
        isPathSelectionMode: false,
        isPlaying: false,
      });
      return false; // End tour
    }
    
    // Case 3: Only one path from POI - prepare it for user selection
    if (availablePaths.length === 1) {
      const targetPath = availablePaths[0];
      console.log('📍 TOUR STORE: Single path available - entering selection mode');
      
      set({
        availablePaths: availablePaths.map(p => p.id),
        selectedPath: targetPath.id,
        isPathSelectionMode: true,
      });
      return false; // Don't auto-continue
    }
    
    // Case 4: Multiple paths - enter path selection mode
    console.log('🔀 TOUR STORE: Multiple paths available - entering selection mode');
    const availablePathIds = availablePaths.map(p => p.id);
    set({
      availablePaths: availablePathIds,
      selectedPath: availablePathIds[0], // Select first available path as default
      isPathSelectionMode: true,
    });
    
    return false; // Don't auto-advance
  },
  
  visitPOI: (poiId) => {
    const state = get();
    if (!state.visitedPOIs.includes(poiId)) {
      const newVisitedPOIs = [...state.visitedPOIs, poiId];
      const availableDestinations = get().getAvailableDestinations();
      
      set({
        visitedPOIs: newVisitedPOIs,
        activePOI: poiId,
        availableDestinations,
        selectedDestination: availableDestinations.length > 0 ? availableDestinations[0] : null,
      });
    }
  },

  getAvailableDestinations: () => {
    const state = get();
    if (!state.tourData || !state.activePOI) {
      console.log('🔍 getAvailableDestinations: No tour data or active POI', {
        hasTourData: !!state.tourData,
        activePOI: state.activePOI
      });
      return [];
    }
    
    const currentPOI = state.activePOI;
    const availablePaths: string[] = [];
    
    console.log('🔍 getAvailableDestinations: Finding paths from POI:', currentPOI);
    
    // Find paths that start from or end at the current POI
    state.tourData.paths.forEach((path, index) => {
      // If we're at the start POI of a path, we can go to the end POI
      if (path.startPOI === currentPOI && path.endPOI) {
        console.log(`  🛤️ Path ${index}: ${currentPOI} → ${path.endPOI}`);
        availablePaths.push(path.endPOI);
      }
      // If we're at the end POI of a bidirectional path, we can go to the start POI
      if (path.endPOI === currentPOI && path.startPOI) {
        console.log(`  🔄 Path ${index}: ${currentPOI} ← ${path.startPOI} (bidirectional)`);
        availablePaths.push(path.startPOI);
      }
    });
    
    // Remove duplicates and sort by visited status (unvisited first)
    const uniqueDestinations = [...new Set(availablePaths)];
    const unvisited = uniqueDestinations.filter(poiId => !state.visitedPOIs.includes(poiId));
    const visited = uniqueDestinations.filter(poiId => state.visitedPOIs.includes(poiId));
    
    const result = [...unvisited, ...visited];
    console.log('🔍 getAvailableDestinations: Result:', {
      total: result.length,
      unvisited: unvisited.length,
      visited: visited.length,
      destinations: result
    });
    
    return result;
  },

  selectDestination: (poiId) => {
    set({ selectedDestination: poiId });
  },

  navigateToDestination: () => {
    const state = get();
    if (!state.selectedDestination || !state.tourData || !state.activePOI) return;
    
    const currentPOI = state.activePOI;
    const targetPOI = state.selectedDestination;
    
    // Find the path that connects these POIs
    const connectingPath = state.tourData.paths.find(path => 
      (path.startPOI === currentPOI && path.endPOI === targetPOI) ||
      (path.endPOI === currentPOI && path.startPOI === targetPOI)
    );
    
    if (connectingPath) {
      const pathIndex = state.tourData.paths.findIndex(p => p.id === connectingPath.id);
      const totalSegments = state.tourData.paths.length;
      const overallProgress = pathIndex / totalSegments;
      
      // Determine direction and set starting point
      const isReversed = connectingPath.endPOI === currentPOI && connectingPath.startPOI === targetPOI;
      const startPoint = isReversed 
        ? connectingPath.points[connectingPath.points.length - 1]
        : connectingPath.points[0];
      
      console.log('🚀 TOUR STORE: navigateToDestination() - moving from', currentPOI, 'to', targetPOI, 'via path', pathIndex);
      
      set({
        currentSegmentIndex: pathIndex,
        segmentProgress: 0,
        currentPoint: startPoint,
        isPlaying: true,
        progress: overallProgress,
        selectedDestination: null,
      });
    }
  },

  getAvailablePaths: () => {
    const state = get();
    return state.availablePaths;
  },

  selectPath: (pathId) => {
    set({ selectedPath: pathId });
  },

  navigateToPath: () => {
    const state = get();
    console.log('🚀 TOUR STORE: navigateToPath() called with state:', {
      selectedPath: state.selectedPath,
      hasTourData: !!state.tourData,
      isPathSelectionMode: state.isPathSelectionMode
    });
    
    if (!state.selectedPath || !state.tourData) {
      console.log('❌ TOUR STORE: navigateToPath() - missing selectedPath or tourData');
      return;
    }
    
    const targetPath = state.tourData.paths.find(p => p.id === state.selectedPath);
    if (!targetPath) {
      console.log('❌ TOUR STORE: navigateToPath() - targetPath not found for id:', state.selectedPath);
      return;
    }
    
    // Determine if this is a reverse path by checking where we actually are now
    const lastVisitedPOI = state.visitedPOIs[state.visitedPOIs.length - 1];
    const currentPath = state.tourData.paths[state.currentSegmentIndex];
    const currentLocationPOI = lastVisitedPOI || currentPath?.endPOI;
    
    // If target path starts from where we are → traverse forward
    // If target path ends where we are → traverse reverse
    const isReversePath = targetPath.endPOI === currentLocationPOI && targetPath.startPOI !== currentLocationPOI;
    
    console.log('🔄 TOUR STORE: Path direction analysis:', {
      targetPathId: targetPath.id,
      targetStartPOI: targetPath.startPOI,
      targetEndPOI: targetPath.endPOI,
      currentLocationPOI,
      lastVisitedPOI,
      isReversePath
    });
    
    const pathIndex = state.tourData.paths.findIndex(p => p.id === state.selectedPath);
    const totalSegments = state.tourData.paths.length;
    const overallProgress = pathIndex / totalSegments;
    
    // For reverse paths, we need to start from the end and traverse backwards
    const startPoint = isReversePath 
      ? targetPath.points[targetPath.points.length - 1]  // Start from end for reverse
      : targetPath.points[0];  // Start from beginning for forward
    
    console.log('🚀 TOUR STORE: navigateToPath() - moving to path', pathIndex, 'with id:', state.selectedPath, isReversePath ? '(REVERSE)' : '(FORWARD)');
    
    set({
      currentSegmentIndex: pathIndex,
      segmentProgress: 0,
      currentPoint: startPoint,
      isPlaying: true,
      progress: overallProgress,
      selectedPath: null,
      availablePaths: [],
      isPathSelectionMode: false,
      // Store reverse direction info for animation
      isReverseDirection: isReversePath,
    });
    
    console.log('✅ TOUR STORE: navigateToPath() - state updated, should start animation');
  },
}));