import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useTourStore } from '../store/tourStore';
import { POI } from '@site-tour-tools/shared';
import '../styles.css';

interface TourCanvasProps {
  className?: string;
  showPOILabels?: boolean;
  onPOIClick?: (poi: POI) => void;
  enableZoomPan?: boolean;
  isMobile?: boolean;
  autoFollow?: boolean;
}

const TourCanvas: React.FC<TourCanvasProps> = ({ 
  className = '',
  showPOILabels = true,
  onPOIClick,
  enableZoomPan = true,
  isMobile = false,
  autoFollow = true
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    tourData,
    currentPoint,
    activePOI,
    visitedPOIs,
    currentSegmentIndex,
    segmentProgress,
    availablePaths,
    selectedPath,
    isPathSelectionMode,
    selectPath,
    navigateToPath,
  } = useTourStore();

  // Auto-fit image to viewport when tour data loads
  useEffect(() => {
    if (tourData && transformRef.current && wrapperRef.current && enableZoomPan) {
      setTimeout(() => {
        if (transformRef.current && wrapperRef.current) {
          const wrapper = wrapperRef.current;
          const rect = wrapper.getBoundingClientRect();
          
          if (isMobile) {
            // For mobile, reset to no transform - let CSS handle sizing
            transformRef.current.resetTransform();
          } else {
            // Desktop auto-fit logic
            const scaleX = rect.width / tourData.backgroundImage.width;
            const scaleY = rect.height / tourData.backgroundImage.height;
            const scale = Math.min(scaleX, scaleY);
            
            transformRef.current.setTransform(
              (rect.width - tourData.backgroundImage.width * scale) / 2,
              (rect.height - tourData.backgroundImage.height * scale) / 2,
              scale
            );
          }
        }
      }, 100);
    }
  }, [tourData, enableZoomPan, isMobile]);

  // Auto-follow current path segment when tour starts or segment changes
  const lastSegmentRef = useRef<number>(-1);
  
  // Debug effect to track currentSegmentIndex changes
  useEffect(() => {
    console.log('📊 SEGMENT TRACKER: currentSegmentIndex changed to', currentSegmentIndex);
  }, [currentSegmentIndex]);
  
  useEffect(() => {
    console.log('🎯 AUTO-FOLLOW: Effect triggered:', {
      hasTourData: !!tourData,
      hasTransformRef: !!transformRef.current,
      hasWrapperRef: !!wrapperRef.current,
      enableZoomPan,
      autoFollow,
      pathsLength: tourData?.paths?.length || 0,
      currentSegmentIndex,
      lastSegmentIndex: lastSegmentRef.current
    });
    
    if (
      tourData && 
      transformRef.current && 
      wrapperRef.current && 
      enableZoomPan && 
      autoFollow &&
      tourData.paths.length > 0
    ) {
      const currentPath = tourData.paths[currentSegmentIndex];
      if (!currentPath || currentPath.points.length < 2) {
        console.log('🙅 AUTO-FOLLOW: No valid path found for segment', currentSegmentIndex);
        return;
      }

      const isNewSegment = lastSegmentRef.current !== currentSegmentIndex;
      
      console.log('🔄 AUTO-FOLLOW: Segment check:', {
        currentSegmentIndex,
        lastSegmentIndex: lastSegmentRef.current,
        isNewSegment
      });
      
      // Only reframe on new segments, not during continuous progress
      if (!isNewSegment) {
        console.log('⏭️ AUTO-FOLLOW: Skipping - same segment as before');
        return;
      }
      
      console.log('🎥 AUTO-FOLLOW: NEW SEGMENT DETECTED! Following segment', currentSegmentIndex);
      lastSegmentRef.current = currentSegmentIndex;

      // Quick transform application with fallback
      const applyAutoFollow = () => {
        console.log('🎥 AUTO-FOLLOW: Starting quick transform application...');
        
        if (!transformRef.current || !wrapperRef.current) {
          console.log('🎥 AUTO-FOLLOW: Missing refs - aborting');
          return;
        }

        const wrapper = wrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        
        // Enhanced mobile detection
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowAspectRatio = windowWidth / windowHeight;
        const isActuallyMobile = windowWidth <= 768 || windowAspectRatio < 1.2;
        
        console.log('🎥 AUTO-FOLLOW: Mobile detection details:', {
          windowSize: { width: windowWidth, height: windowHeight },
          windowAspectRatio,
          isMobileProp: isMobile,
          isActuallyMobile,
          rectSize: { width: rect.width, height: rect.height }
        });
        
        // Calculate path bounding box
        const pathPoints = currentPath.points;
        const minX = Math.min(...pathPoints.map(p => p.x));
        const maxX = Math.max(...pathPoints.map(p => p.x));
        const minY = Math.min(...pathPoints.map(p => p.y));
        const maxY = Math.max(...pathPoints.map(p => p.y));
        
        const pathWidth = maxX - minX;
        const pathHeight = maxY - minY;
        const pathCenterX = minX + pathWidth / 2;
        const pathCenterY = minY + pathHeight / 2;

        // Try to get current transform state for smart scaling
        const transformState = transformRef.current.state;
        let targetScale;
        let useSmartScaling = false;
        
        if (transformState && transformState.scale) {
          console.log('🎥 AUTO-FOLLOW: Using smart scaling with current state');
          useSmartScaling = true;
          
          // Add padding for smart scaling
          const padding = Math.max(Math.max(pathWidth, pathHeight) * 0.2, 100);
          const requiredWidth = pathWidth + padding * 2;
          const requiredHeight = pathHeight + padding * 2;
          
          // Calculate scale needed to fit the path with padding
          const scaleToFitX = rect.width / requiredWidth;
          const scaleToFitY = rect.height / requiredHeight;
          const scaleToFit = Math.min(scaleToFitX, scaleToFitY);
          
          const currentScale = transformState.scale;
          
          if (scaleToFit >= currentScale) {
            // Path fits at current zoom - just pan
            targetScale = currentScale;
          } else {
            // Path needs zoom out to fit
            targetScale = Math.max(scaleToFit, 0.1);
          }
        } else {
          console.log('🎥 AUTO-FOLLOW: Using simple scaling (transform state not ready)');
          // Fallback to simple fit-to-viewport scaling
          const imageWidth = tourData.backgroundImage.width;
          const imageHeight = tourData.backgroundImage.height;
          const scaleX = rect.width / imageWidth;
          const scaleY = rect.height / imageHeight;
          
          if (isActuallyMobile) {
            // On mobile, use more aggressive scaling to better utilize screen space
            // Use the larger scale factor but cap it to avoid making it too large
            targetScale = Math.min(Math.max(scaleX, scaleY), 2.5);
            console.log('🎥 AUTO-FOLLOW: Mobile scaling - using max scale for better space utilization');
          } else {
            // On desktop, use conservative scaling to fit entire image
            targetScale = Math.min(scaleX, scaleY);
          }
        }
        
        // Calculate translation to center the path
        const scaledPathCenterX = pathCenterX * targetScale;
        const scaledPathCenterY = pathCenterY * targetScale;
        const translateX = (rect.width / 2) - scaledPathCenterX;
        const translateY = (rect.height / 2) - scaledPathCenterY;
        
        console.log('🎥 AUTO-FOLLOW: Transform calculation:', {
          path: { centerX: pathCenterX, centerY: pathCenterY, width: pathWidth, height: pathHeight },
          viewport: { width: rect.width, height: rect.height },
          image: { width: tourData.backgroundImage.width, height: tourData.backgroundImage.height },
          isMobile,
          scaling: useSmartScaling ? 'smart' : 'simple',
          scaleFactors: { scaleX: rect.width / tourData.backgroundImage.width, scaleY: rect.height / tourData.backgroundImage.height },
          targetScale,
          scaledPathCenter: { x: scaledPathCenterX, y: scaledPathCenterY },
          viewportCenter: { x: rect.width / 2, y: rect.height / 2 },
          translation: { x: translateX, y: translateY }
        });
        
        // Apply the transform
        console.log('🎥 AUTO-FOLLOW: Applying setTransform with', { translateX, translateY, targetScale });
        
        try {
          // Use working reset timing but with smoother visual transition
          console.log('🎥 AUTO-FOLLOW: Reliable reset with smooth visual transition...');
          
          // Get current transform before reset for smooth transition calculation
          const beforeState = transformRef.current.state;
          console.log('🎥 AUTO-FOLLOW: Current state before reset:', beforeState);
          
          // Reset with working timing
          //transformRef.current.resetTransform(0); // Instant reset for reliability
          
          setTimeout(() => {
            console.log('🎥 AUTO-FOLLOW: Applying setTransform after reset...');
            if (transformRef.current) {
              // Use a longer animation duration to make the transition more gradual
              transformRef.current.setTransform(translateX, translateY, targetScale, 1200);
            }
          }, 100); // Proven working delay
          
          // Verify the transform was applied by checking DOM after animation
          setTimeout(() => {
            const transformWrapper = wrapper.querySelector('[data-testid="transform-wrapper"]') || 
                                   wrapper.querySelector('[class*="transform"]') ||
                                   wrapper.querySelector('div[style*="transform"]');
            
            if (transformWrapper) {
              const style = (transformWrapper as HTMLElement).style.transform;
              console.log('🎥 AUTO-FOLLOW: DOM transform after setTransform:', style);
            } else {
              console.log('🎥 AUTO-FOLLOW: Could not find transform element in DOM');
              // Log all divs to see what's there
              const allDivs = wrapper.querySelectorAll('div');
              console.log('🎥 AUTO-FOLLOW: Found divs:', Array.from(allDivs).map(div => ({
                classes: (div as HTMLElement).className,
                style: (div as HTMLElement).style.transform || 'no transform'
              })));
            }
            
            // Also check the transform ref state
            const currentState = transformRef.current?.state;
            console.log('🎥 AUTO-FOLLOW: Transform ref state after setTransform:', currentState);
          }, 900);
          
        } catch (error) {
          console.error('🎥 AUTO-FOLLOW: Error calling setTransform:', error);
        }
      };
      
      // Apply auto-follow with minimal delay
      setTimeout(applyAutoFollow, 50); // Small delay to ensure DOM is ready
    }
  }, [tourData, enableZoomPan, autoFollow, currentSegmentIndex, isMobile]);

  // Force override fit-content styles after component mounts
  useEffect(() => {
    if (wrapperRef.current && enableZoomPan) {
      const forceStyles = () => {
        const wrapper = wrapperRef.current;
        if (wrapper) {
          // Find all transform-related divs and force their styles
          const transformDivs = wrapper.querySelectorAll('div[class*="transform"]');
          transformDivs.forEach((div) => {
            const element = div as HTMLElement;
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.maxWidth = '100%';
            element.style.maxHeight = '100%';
          });
        }
      };

      // Apply immediately and also after a short delay
      forceStyles();
      setTimeout(forceStyles, 50);
      setTimeout(forceStyles, 200);
    }
  }, [enableZoomPan, tourData]);

  if (!tourData) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">No Tour Data</h3>
          <p className="text-sm">Load tour data to begin</p>
        </div>
      </div>
    );
  }

  const { backgroundImage, pois, paths } = tourData;

  const canvasContent = (
    <div
      className="relative block w-full h-full"
    >
      {/* Background Image */}
      <img
        src={backgroundImage.url}
        alt="Tour background"
        className="block pointer-events-none w-full h-full object-contain"
        draggable={false}
      />

      {/* SVG Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${backgroundImage.width} ${backgroundImage.height}`}
      >
        {/* Render paths */}
        <g className="paths">
          {paths.map((path, pathIndex) => {
            const pathLength = path.points.length;
            if (pathLength < 2) return null;

            const pathData = `M ${path.points[0].x} ${path.points[0].y} ` +
              path.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

            // Determine path visibility and interaction
            const isCurrentPath = pathIndex === currentSegmentIndex;
            
            // A path is completed if both its start and end POIs have been visited
            const isCompletedPath = path.startPOI && path.endPOI && 
              visitedPOIs.includes(path.startPOI) && visitedPOIs.includes(path.endPOI);
            const isAvailablePath = isPathSelectionMode && availablePaths.includes(path.id);
            const isSelectedPath = isPathSelectionMode && selectedPath === path.id;
            const isDefaultPath = isPathSelectionMode && availablePaths.length > 0 && path.id === availablePaths[0];
            
            // Determine if this is a reverse path by checking if we're in selection mode
            // and if the current path's endPOI matches this path's endPOI
            const currentPath = tourData?.paths[currentSegmentIndex];
            const isReversePath = isPathSelectionMode && isAvailablePath && 
              currentPath?.endPOI && path.endPOI === currentPath.endPOI;
            
            // Show completed paths, current path, and available paths in selection mode
            const shouldShowPath = isCurrentPath || isCompletedPath || isAvailablePath;
            
            if (!shouldShowPath) return null;

            // Handle path click in selection mode
            const handlePathClick = () => {
              if (isPathSelectionMode && isAvailablePath) {
                console.log('🖱️ PATH CLICK: Selecting path', path.id);
                selectPath(path.id);
                // Auto-navigate after a short delay to allow user to see selection
                setTimeout(() => {
                  navigateToPath();
                }, 500);
              }
            };

            // Determine path styling
            let pathStroke = path.color || tourData.settings.theme.path.color;
            let pathStrokeWidth = path.width || tourData.settings.theme.path.width;
            let pathOpacity = 1;
            let strokeDasharray = 'none';
            let pathClass = 'pointer-events-none';
            
            if (isPathSelectionMode && isAvailablePath) {
              // Available paths in selection mode
              pathClass = 'pointer-events-auto cursor-pointer';
              
              if (isSelectedPath && !isDefaultPath) {
                // Selected path (non-default) - highlight with thicker stroke and orange
                pathStrokeWidth = pathStrokeWidth + 4;
                pathStroke = '#f97316'; // Orange highlight
                pathOpacity = 1;
              } else if (isDefaultPath) {
                // Default path - solid line, same color and thickness as alternatives
                pathOpacity = 0.8;
                pathStroke = path.color || tourData.settings.theme.path.color; // Same color as alternatives
                // Same thickness as alternatives - no extra thickness even when selected
                // No strokeDasharray = solid line
              } else if (isReversePath) {
                // Reverse paths - dotted line to distinguish from regular alternatives
                strokeDasharray = '2,3';
                pathOpacity = 0.8;
                pathStroke = '#8b5cf6'; // Purple color for reverse paths
              } else {
                // Alternative paths - dashed line
                strokeDasharray = '8,4';
                pathOpacity = 0.8;
                pathStroke = path.color || tourData.settings.theme.path.color; // Same color as default
              }
            } else if (isCompletedPath) {
              pathOpacity = 0.6;
            }
            
            return (
              <g key={path.id}>
                {/* Base path */}
                <path
                  d={pathData}
                  stroke={pathStroke}
                  strokeWidth={pathStrokeWidth}
                  strokeDasharray={strokeDasharray}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={pathOpacity}
                  className={pathClass}
                  onClick={handlePathClick}
                  style={{
                    transition: 'all 0.2s ease',
                  }}
                />
                
                {/* Hover effect for available paths */}
                {isPathSelectionMode && isAvailablePath && (
                  <path
                    d={pathData}
                    stroke="transparent"
                    strokeWidth={pathStrokeWidth + 8}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-auto cursor-pointer hover:stroke-orange-200 hover:opacity-30"
                    onClick={handlePathClick}
                    style={{
                      transition: 'all 0.2s ease',
                    }}
                  />
                )}
                
                {/* Progress indicator on current path */}
                {isCurrentPath && !isPathSelectionMode && (
                  <motion.path
                    d={pathData}
                    stroke={tourData.settings.theme.path.activeColor}
                    strokeWidth={(path.width || tourData.settings.theme.path.width) + 2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: segmentProgress
                    }}
                    transition={{ duration: 0.1 }}
                    style={{
                      strokeDasharray: '1',
                      strokeDashoffset: '1',
                    }}
                  />
                )}

              </g>
            );
          })}
        </g>

        {/* Render POIs */}
        <g className="pois">
          {pois.map((poi) => {
            const isVisited = visitedPOIs.includes(poi.id);
            const isActive = activePOI === poi.id;
            const poiColor = isVisited 
              ? '#10b981' 
              : tourData.settings.theme.poi.color;

            return (
              <g key={poi.id}>
                {/* POI Circle */}
                <motion.circle
                  cx={poi.position.x}
                  cy={poi.position.y}
                  r={tourData.settings.theme.poi.size}
                  fill={poiColor}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => onPOIClick?.(poi)}
                  animate={{
                    scale: isActive ? 1.5 : 1,
                    r: isActive ? tourData.settings.theme.poi.size * 1.2 : tourData.settings.theme.poi.size,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Active POI pulse effect */}
                {isActive && (
                  <motion.circle
                    cx={poi.position.x}
                    cy={poi.position.y}
                    r={tourData.settings.theme.poi.size}
                    fill="none"
                    stroke={poiColor}
                    strokeWidth={2}
                    animate={{
                      r: [tourData.settings.theme.poi.size, tourData.settings.theme.poi.size * 2],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}

                {/* POI Label */}
                {showPOILabels && (poi.showLabel !== false) && (
                  <text
                    x={poi.position.x}
                    y={poi.position.y - tourData.settings.theme.poi.size - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill={tourData.settings.theme.text}
                    fontWeight="500"
                    className="pointer-events-none select-none"
                    style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
                  >
                    {poi.label}
                  </text>
                )}

                {/* Visited indicator */}
                {isVisited && (
                  <motion.path
                    d={`M ${poi.position.x - 4} ${poi.position.y} L ${poi.position.x - 1} ${poi.position.y + 3} L ${poi.position.x + 4} ${poi.position.y - 3}`}
                    stroke="#ffffff"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Current position indicator */}
        {currentPoint && (
          <g>
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={8}
              fill={tourData.settings.theme.accent || '#3b82f6'}
              stroke="#ffffff"
              strokeWidth={3}
            />
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={4}
              fill="#ffffff"
            />
          </g>
        )}
      </svg>
    </div>
  );

  if (!enableZoomPan) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="w-full h-full bg-gray-50">
          {canvasContent}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      <TransformWrapper
        ref={transformRef}
        key={backgroundImage.url}
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        centerOnInit={false}
        centerZoomedOut={false}
        wheel={{ disabled: false }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: false, mode: 'zoomIn', step: 0.7 }}
        limitToBounds={false}
        alignmentAnimation={{ disabled: isMobile }}
        panning={{
          disabled: false,
          lockAxisX: false,
          lockAxisY: false
        }}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass={isMobile ? "w-full h-full flex items-start justify-center" : "w-full h-full"}
        >
          <div 
            className={isMobile ? "w-full h-full" : ""}
            style={isMobile ? {
              aspectRatio: `${backgroundImage.width} / ${backgroundImage.height}`,
            } : {}}
          >
            {canvasContent}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default TourCanvas;