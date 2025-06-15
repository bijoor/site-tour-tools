import React, { useEffect, useState } from 'react';
import { TourData, POI } from '@site-tour-tools/shared';
import { useTourStore } from '../store/tourStore';
import { useTourAnimation } from '../hooks/useTourAnimation';
import TourCanvas from './TourCanvas';
import TourControls from './TourControls';
import POIPanel from './POIPanel';

export interface TourComponentProps {
  tourData: TourData;
  className?: string;
  autoStart?: boolean;
  showControls?: boolean;
  showPOILabels?: boolean;
  showPOIPanel?: boolean;
  onTourComplete?: () => void;
  onPOIVisit?: (poi: POI) => void;
}

const TourComponent: React.FC<TourComponentProps> = ({
  tourData,
  className = '',
  autoStart = false,
  showControls = true,
  showPOILabels = true,
  showPOIPanel = true,
  onTourComplete,
  onPOIVisit,
}) => {
  const {
    setTourData,
    play,
    activePOI,
    visitedPOIs,
    progress,
    isPlaying,
  } = useTourStore();

  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [showPOIInfo, setShowPOIInfo] = useState(false);

  // Initialize tour animation
  useTourAnimation();

  // Set tour data when component mounts or tourData changes
  useEffect(() => {
    setTourData(tourData);
    
    if (autoStart || tourData.settings.autoStart) {
      play();
    }
  }, [tourData, autoStart, setTourData, play]);

  // Handle tour completion
  useEffect(() => {
    if (progress >= 1 && !isPlaying) {
      onTourComplete?.();
    }
  }, [progress, isPlaying, onTourComplete]);

  // Handle POI visits
  useEffect(() => {
    if (activePOI) {
      const poi = tourData.pois.find(p => p.id === activePOI);
      if (poi) {
        onPOIVisit?.(poi);
        
        if (showPOIPanel) {
          setSelectedPOI(poi);
          setShowPOIInfo(true);
        }
      }
    }
  }, [activePOI, tourData.pois, onPOIVisit, showPOIPanel]);

  const handlePOIClick = (poi: POI) => {
    if (showPOIPanel) {
      setSelectedPOI(poi);
      setShowPOIInfo(true);
    }
  };

  const handleClosePOIPanel = () => {
    setShowPOIInfo(false);
    setSelectedPOI(null);
  };

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Main tour canvas */}
      <div className="relative">
        <TourCanvas
          className="w-full h-full"
          showPOILabels={showPOILabels}
          onPOIClick={handlePOIClick}
        />
        
        {/* POI Information Panel */}
        {showPOIPanel && (
          <div className="absolute top-4 right-4 z-10 w-80 max-w-sm">
            <POIPanel
              poi={selectedPOI}
              isVisible={showPOIInfo}
              onClose={handleClosePOIPanel}
            />
          </div>
        )}
      </div>

      {/* Tour Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <TourControls
            className="w-96 max-w-sm"
            showSpeedControl={true}
            showVolumeControl={false}
          />
        </div>
      )}

      {/* Tour Progress Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span>
              {Math.round(progress * 100)}% Complete
            </span>
          </div>
          <div className="text-xs mt-1 opacity-75">
            {visitedPOIs.length} / {tourData.pois.length} POIs visited
          </div>
        </div>
      </div>

      {/* Tour Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 text-center">
            {tourData.name}
          </h2>
          {tourData.description && (
            <p className="text-sm text-gray-600 text-center mt-1">
              {tourData.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourComponent;