import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTourStore } from '../store/tourStore';

interface TourControlsProps {
  className?: string;
  showSpeedControl?: boolean;
  showVolumeControl?: boolean;
  onSettingsClick?: () => void;
}

const TourControls: React.FC<TourControlsProps> = ({
  className = '',
  showSpeedControl = true,
  showVolumeControl = false,
  onSettingsClick,
}) => {
  const {
    isPlaying,
    segmentProgress,
    currentSegmentIndex,
    speed,
    tourData,
    activePOI,
    availableDestinations,
    selectedDestination,
    visitedPOIs,
    availablePaths,
    selectedPath,
    isPathSelectionMode,
    play,
    pause,
    stop,
    setSpeed,
    nextSegment,
    previousSegment,
    selectDestination,
    navigateToDestination,
    selectPath,
    navigateToPath,
  } = useTourStore();

  // Debug: log the current state
  console.log('🎮 TOUR CONTROLS: Current state:', { 
    isPlaying, 
    tourData: !!tourData, 
    isPathSelectionMode,
    availablePaths: availablePaths.length,
    selectedPath 
  });

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleProgressChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
    // For now, disable manual seeking in segment mode
    // Could be enhanced later to seek within current segment
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  const handleDestinationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const poiId = event.target.value;
    selectDestination(poiId);
  };

  const handleNavigate = () => {
    if (selectedDestination) {
      navigateToDestination();
    }
  };

  const handlePathChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pathId = event.target.value;
    selectPath(pathId);
  };

  const handlePathNavigate = () => {
    if (selectedPath) {
      navigateToPath();
    }
  };

  const formatTime = (progress: number) => {
    if (!tourData) return '0:00';
    
    // Assuming 10 seconds per segment at 1x speed
    const totalSeconds = 10 / speed;
    const currentSeconds = totalSeconds * progress;
    
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!tourData) {
    console.log('🎮 TOUR CONTROLS: No tour data - not rendering');
    return null;
  }
  
  console.log('🎮 TOUR CONTROLS: Rendering with path selection state:', {
    isPathSelectionMode,
    availablePathsCount: availablePaths.length,
    selectedPath,
    shouldShowPathSelection: isPathSelectionMode && availablePaths.length > 0
  });

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Segment Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Segment {currentSegmentIndex + 1} of {tourData.paths.length}</span>
          <span>{formatTime(segmentProgress)} / {formatTime(1)}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={segmentProgress}
            onChange={handleProgressChange}
            disabled
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed slider"
          />
          <div
            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-lg pointer-events-none"
            style={{ width: `${segmentProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={previousSegment}
          disabled={currentSegmentIndex === 0}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Segment"
        >
          <SkipBack size={20} />
        </button>

        <motion.button
          onClick={handlePlayPause}
          className={`p-3 rounded-full ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </motion.button>

        <button
          onClick={stop}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          title="Stop"
        >
          <Square size={20} />
        </button>

        <button
          onClick={nextSegment}
          disabled={currentSegmentIndex >= tourData.paths.length - 1}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Segment"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Additional Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Speed Control */}
          {showSpeedControl && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Speed:</label>
              <select
                value={speed}
                onChange={handleSpeedChange}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
              </select>
            </div>
          )}

          {/* Volume Control */}
          {showVolumeControl && (
            <div className="flex items-center space-x-2">
              <Volume2 size={16} className="text-gray-600" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Settings */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        )}
      </div>

      {/* Path Selection Mode - Always show when in selection mode */}
      {isPathSelectionMode && availablePaths.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-gray-200 bg-yellow-50 rounded-lg p-3">
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <ArrowRight size={16} className="text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {availablePaths.length === 1 ? 'Continue to next path:' : 'Choose your next path:'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPath || ''}
                onChange={handlePathChange}
                className="flex-1 text-sm border border-orange-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select path...</option>
                {availablePaths.map(pathId => {
                  const pathIndex = tourData?.paths.findIndex(p => p.id === pathId) ?? -1;
                  const isDefault = pathId === tourData?.paths[currentSegmentIndex + 1]?.id;
                  return (
                    <option key={pathId} value={pathId}>
                      Path {pathIndex + 1}
                      {isDefault ? ' (default)' : ''}
                    </option>
                  );
                })}
              </select>
              <motion.button
                onClick={handlePathNavigate}
                disabled={!selectedPath}
                className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                  selectedPath 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                whileHover={selectedPath ? { scale: 1.02 } : {}}
                whileTap={selectedPath ? { scale: 0.98 } : {}}
                title="Continue on selected path"
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>

          {/* Path Options List */}
          {availablePaths.length > 1 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Available paths:</p>
              <div className="flex flex-wrap gap-1">
                {availablePaths.map(pathId => {
                  const pathIndex = tourData?.paths.findIndex(p => p.id === pathId) ?? -1;
                  const isSelected = selectedPath === pathId;
                  const isDefault = pathId === tourData?.paths[currentSegmentIndex + 1]?.id;
                  
                  return (
                    <button
                      key={pathId}
                      onClick={() => selectPath(pathId)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        isSelected
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : isDefault
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                      title={`Path ${pathIndex + 1}${isDefault ? ' (default next path)' : ''}`}
                    >
                      Path {pathIndex + 1}
                      {isDefault && <span className="ml-1 text-blue-600">•</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Interactive POI Selection */}
      {!isPathSelectionMode && activePOI && availableDestinations.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <MapPin size={16} className="text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Where would you like to go next?
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedDestination || ''}
                onChange={handleDestinationChange}
                className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select destination...</option>
                {availableDestinations.map(poiId => {
                  const poi = tourData.pois.find(p => p.id === poiId);
                  const isVisited = visitedPOIs.includes(poiId);
                  return (
                    <option key={poiId} value={poiId}>
                      {poi?.label} {isVisited ? '(visited)' : '(new)'}
                    </option>
                  );
                })}
              </select>
              <motion.button
                onClick={handleNavigate}
                disabled={!selectedDestination}
                className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                  selectedDestination 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                whileHover={selectedDestination ? { scale: 1.02 } : {}}
                whileTap={selectedDestination ? { scale: 0.98 } : {}}
                title="Navigate to selected POI"
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>

          {/* Alternative Destinations List */}
          {availableDestinations.length > 1 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">All available destinations:</p>
              <div className="flex flex-wrap gap-1">
                {availableDestinations.map(poiId => {
                  const poi = tourData.pois.find(p => p.id === poiId);
                  const isVisited = visitedPOIs.includes(poiId);
                  const isSelected = selectedDestination === poiId;
                  
                  return (
                    <button
                      key={poiId}
                      onClick={() => selectDestination(poiId)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        isSelected
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : isVisited
                          ? 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      }`}
                      title={`${poi?.label} - ${isVisited ? 'Previously visited' : 'Not yet visited'}`}
                    >
                      {poi?.label}
                      {!isVisited && <span className="ml-1 text-green-600">•</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : !isPathSelectionMode && activePOI ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Current location: {tourData.pois.find(p => p.id === activePOI)?.label}
            <br />
            <span className="text-xs">No destinations available from this POI</span>
          </div>
        </div>
      ) : !isPathSelectionMode ? (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="text-xs">Press Play to start the tour</span>
          </div>
        </div>
      ) : null}

      {/* Tour Info */}
      <div className={`${activePOI && availableDestinations.length > 0 ? 'mt-4' : 'mt-4'} pt-4 border-t border-gray-200`}>
        <div className="flex items-center justify-center text-sm text-gray-600">
          <span>
            {visitedPOIs?.length || 0} / {tourData.pois.length} POIs visited
          </span>
        </div>
        {activePOI && (
          <div className="mt-2 text-xs text-gray-500">
            Current location: {tourData.pois.find(p => p.id === activePOI)?.label || 'Unknown'}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TourControls;