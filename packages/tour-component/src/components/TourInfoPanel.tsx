import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, Play, Pause, Square, SkipBack, SkipForward, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { POI } from '@site-tour-tools/shared';
import { useTourStore } from '../store/tourStore';

interface TourInfoPanelProps {
  selectedPOI: POI | null;
  isVisible: boolean;
  className?: string;
  isMobile?: boolean;
}

const TourInfoPanel: React.FC<TourInfoPanelProps> = ({
  selectedPOI,
  isVisible,
  className = '',
  isMobile = false,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const {
    isPlaying,
    segmentProgress,
    currentSegmentIndex,
    speed,
    tourData,
    progress,
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
  } = useTourStore();

  const handlePlayPause = () => {
    console.log('🎮 TOUR INFO PANEL: handlePlayPause called, isPlaying:', isPlaying);
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(event.target.value);
    setSpeed(newSpeed);
  };

  const formatTime = (progress: number) => {
    if (!tourData) return '0:00';
    
    const totalSeconds = 10 / speed;
    const currentSeconds = totalSeconds * progress;
    
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!tourData) return null;

  // Mobile layout
  if (isMobile) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ 
              y: isMinimized ? '40%' : '0%', 
              opacity: 1 
            }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`bg-white shadow-2xl border-t border-gray-200 overflow-hidden absolute bottom-0 left-0 right-0 ${className}`}
            style={{ 
              height: isMinimized ? '60px' : 'min(200px, 40vh)',
              maxHeight: '40vh'
            }}
          >
            <div className={`p-3 transition-all duration-300 ${isMinimized ? 'max-h-16' : 'max-h-96'} overflow-y-auto`}>
              {/* Tour Controls - Always Visible */}
              <div className="space-y-2">
                {/* Header with Minimize Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Tour Controls</span>
                    <button
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {visitedPOIs.length} / {tourData.pois.length} POIs
                  </div>
                </div>

                {/* Progress Bars and Controls - Hidden when minimized */}
                {!isMinimized && (
                  <>
                    {/* Progress Bars */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>Overall</span>
                          <span>{Math.round(progress * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>Segment {currentSegmentIndex + 1}/{tourData.paths.length}</span>
                          <span>{formatTime(segmentProgress)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${segmentProgress * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={previousSegment}
                          disabled={currentSegmentIndex === 0}
                          className="p-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <SkipBack size={14} />
                        </button>

                        <button
                          onClick={handlePlayPause}
                          className={`p-1.5 rounded ${ 
                            isPlaying 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                          title={isPlaying ? 'Pause Tour' : 'Start Tour'}
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>

                        <button
                          onClick={stop}
                          className="p-1.5 text-gray-600 hover:text-gray-800"
                        >
                          <Square size={14} />
                        </button>

                        <button
                          onClick={nextSegment}
                          disabled={currentSegmentIndex >= tourData.paths.length - 1}
                          className="p-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <SkipForward size={14} />
                        </button>
                      </div>

                      {/* Speed Control */}
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-600">Speed:</span>
                        <select
                          value={speed}
                          onChange={handleSpeedChange}
                          className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="1">1x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>
                      </div>
                    </div>

                    {/* POI Information - Shows when POI is selected */}
                    {selectedPOI && (
                      <div className="border-t border-gray-200 pt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                            <MapPin size={12} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {selectedPOI.label}
                            </h4>
                            <p className="text-xs text-gray-500">Point of Interest</p>
                          </div>
                        </div>

                        {selectedPOI.description && (
                          <div className="flex items-start space-x-2">
                            <Info size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {selectedPOI.description}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Position:</span>
                          <span className="text-gray-900 font-mono">
                            ({Math.round(selectedPOI.position.x)}, {Math.round(selectedPOI.position.y)})
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop layout
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: isMinimized ? '80%' : '0%', opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden ${className}`}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {/* Tour Controls Section */}
            <div className="space-y-3">
              {/* Header with Minimize Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {!isMinimized && (
                    <span className="text-sm font-medium text-gray-900">Tour Controls</span>
                  )}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    {isMinimized ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
                {!isMinimized && (
                  <div className="text-xs text-gray-500">
                    {visitedPOIs.length} / {tourData.pois.length} POIs
                  </div>
                )}
              </div>

              {/* Progress Bars and Controls - Hidden when minimized */}
              {!isMinimized && (
                <>
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Overall Progress</span>
                        <span>{Math.round(progress * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Segment {currentSegmentIndex + 1} of {tourData.paths.length}</span>
                        <span>{formatTime(segmentProgress)} / {formatTime(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${segmentProgress * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={previousSegment}
                        disabled={currentSegmentIndex === 0}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <SkipBack size={18} />
                      </button>

                      <button
                        onClick={handlePlayPause}
                        className={`p-2.5 rounded-full ${
                          isPlaying 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                        title={isPlaying ? 'Pause Tour' : 'Start Tour'}
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>

                      <button
                        onClick={stop}
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        <Square size={18} />
                      </button>

                      <button
                        onClick={nextSegment}
                        disabled={currentSegmentIndex >= tourData.paths.length - 1}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        <SkipForward size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">Speed:</span>
                        <select
                          value={speed}
                          onChange={handleSpeedChange}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="0.75">0.75x</option>
                          <option value="1">1x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Path Selection Section */}
                  {isPathSelectionMode && availablePaths.length > 0 && (
                    <div className="border-t border-gray-200 pt-3 space-y-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {availablePaths.length === 1 ? 'Continue to Next Path' : 'Choose Your Next Path'}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-orange-800">
                              Click on a path in the map to continue
                            </span>
                          </div>
                          <div className="text-xs text-orange-700 space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-0.5 bg-blue-500"></div>
                              <span>Solid line = Default path</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-0.5 bg-gray-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #6b7280 0, #6b7280 4px, transparent 4px, transparent 8px)' }}></div>
                              <span>Dashed line = Alternative paths</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-0.5 bg-purple-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #8b5cf6 0, #8b5cf6 2px, transparent 2px, transparent 5px)' }}></div>
                              <span>Dotted purple = Reverse paths</span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedPath && (
                          <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
                            ✓ Selected: {selectedPath === tourData?.paths[currentSegmentIndex + 1]?.id ? 'Default path' : `Path ${tourData?.paths.findIndex(p => p.id === selectedPath) + 1}`}
                          </div>
                        )}
                        
                        {availablePaths.length > 1 && (
                          <div className="text-xs text-gray-500">
                            {availablePaths.length} paths available from this location
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* POI Information Section - Shows when POI is selected */}
                  {selectedPOI && (
                    <div className="border-t border-gray-200 pt-3 space-y-3">
                      <h3 className="text-sm font-medium text-gray-900">Point of Interest</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <MapPin size={16} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {selectedPOI.label}
                            </h4>
                            <p className="text-xs text-gray-500">Point of Interest</p>
                          </div>
                        </div>

                        {selectedPOI.description && (
                          <div className="flex items-start space-x-2">
                            <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="text-xs font-medium text-gray-900 mb-1">Description</h5>
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {selectedPOI.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedPOI.metadata && Object.keys(selectedPOI.metadata).length > 0 && (
                          <div className="pt-2 border-t border-gray-200">
                            <h5 className="text-xs font-medium text-gray-900 mb-2">Additional Information</h5>
                            <div className="space-y-1">
                              {Object.entries(selectedPOI.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-xs text-gray-600 capitalize">
                                    {key.replace(/[_-]/g, ' ')}:
                                  </span>
                                  <span className="text-xs text-gray-900 font-medium">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200">
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Position:</span>
                              <span className="text-gray-900 font-mono">
                                ({Math.round(selectedPOI.position.x)}, {Math.round(selectedPOI.position.y)})
                              </span>
                            </div>
                            {selectedPOI.isConnected !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Connected:</span>
                                <span className={`font-medium ${
                                  selectedPOI.isConnected ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {selectedPOI.isConnected ? 'Yes' : 'No'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tour Info Footer - Only show description if available */}
            {!isMinimized && tourData.description && (
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-600">{tourData.description}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TourInfoPanel;