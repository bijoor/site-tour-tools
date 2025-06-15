import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings
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
    play,
    pause,
    stop,
    setSpeed,
    nextSegment,
    previousSegment,
  } = useTourStore();

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
    return null;
  }

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

      {/* Tour Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{tourData.name}</span>
          <span>
            {useTourStore.getState().visitedPOIs?.length || 0} / {tourData.pois.length} POIs visited
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TourControls;