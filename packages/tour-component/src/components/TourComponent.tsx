import React, { useEffect, useState } from 'react';
import { TourData, POI } from '@site-tour-tools/shared';
import { useTourStore } from '../store/tourStore';
import { useTourAnimation } from '../hooks/useTourAnimation';
import TourCanvas from './TourCanvas';
import TourInfoPanel from './TourInfoPanel';

export interface TourComponentProps {
  tourData: TourData;
  className?: string;
  autoStart?: boolean;
  showControls?: boolean;
  showPOILabels?: boolean;
  showInfoPanel?: boolean;
  enableZoomPan?: boolean;
  onTourComplete?: () => void;
  onPOIVisit?: (poi: POI) => void;
}

const TourComponent: React.FC<TourComponentProps> = ({
  tourData,
  className = '',
  autoStart = false,
  showPOILabels = true,
  showInfoPanel = true,
  enableZoomPan = true,
  onTourComplete,
  onPOIVisit,
}) => {
  const {
    setTourData,
    play,
    activePOI,
    progress,
    isPlaying,
  } = useTourStore();

  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [showInfoPanelState, setShowInfoPanelState] = useState(true); // Always show the panel
  const [isMobile, setIsMobile] = useState(false);

  // Initialize tour animation
  useTourAnimation();

  // Detect mobile/desktop based on screen size and aspect ratio
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Mobile layout: narrow screens or portrait orientation
      // Desktop layout: wide screens with landscape orientation
      setIsMobile(width <= 768 || aspectRatio < 1.2);
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

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
        
        if (showInfoPanel) {
          setSelectedPOI(poi);
          setShowInfoPanelState(true);
        }
      }
    }
  }, [activePOI, tourData.pois, onPOIVisit, showInfoPanel]);

  const handlePOIClick = (poi: POI) => {
    if (showInfoPanel) {
      setSelectedPOI(poi);
      setShowInfoPanelState(true);
    }
  };


  if (isMobile) {
    // Mobile Layout: Canvas takes full space, panel overlays from bottom
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ height: '100vh', maxHeight: '100vh' }}>
        {/* Main tour canvas - full viewport */}
        <div className="absolute inset-0">
          <TourCanvas
            className="w-full h-full"
            showPOILabels={showPOILabels}
            onPOIClick={handlePOIClick}
            enableZoomPan={enableZoomPan}
            isMobile={true}
          />
        </div>

        {/* Combined Info Panel - Overlays from bottom */}
        {showInfoPanel && (
          <TourInfoPanel
            selectedPOI={selectedPOI}
            isVisible={showInfoPanelState}
            isMobile={true}
          />
        )}
      </div>
    );
  }

  // Desktop Layout: Canvas on left, panel on right
  return (
    <div className={`flex bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ height: '100%' }}>
      {/* Main tour canvas - takes remaining space */}
      <div className="flex-1 relative">
        <TourCanvas
          className="w-full h-full"
          showPOILabels={showPOILabels}
          onPOIClick={handlePOIClick}
          enableZoomPan={enableZoomPan}
          isMobile={false}
        />
      </div>

      {/* Combined Info Panel - Fixed on right */}
      {showInfoPanel && (
        <div className="flex-shrink-0 w-96 max-w-sm">
          <TourInfoPanel
            selectedPOI={selectedPOI}
            isVisible={showInfoPanelState}
            isMobile={false}
          />
        </div>
      )}
    </div>
  );
};

export default TourComponent;