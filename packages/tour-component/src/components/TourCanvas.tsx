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
}

const TourCanvas: React.FC<TourCanvasProps> = ({ 
  className = '',
  showPOILabels = true,
  onPOIClick,
  enableZoomPan = true,
  isMobile = false
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
      className="relative block"
      style={isMobile ? {
        width: '100%',
        height: '100%',
      } : {
        width: backgroundImage.width,
        height: backgroundImage.height,
      }}
    >
      {/* Background Image */}
      <img
        src={backgroundImage.url}
        alt="Tour background"
        className={isMobile ? "block pointer-events-none w-full h-full object-contain" : "block pointer-events-none"}
        draggable={false}
        style={isMobile ? {} : {
          width: backgroundImage.width,
          height: backgroundImage.height,
        }}
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

            // Only show paths that have been reached (current or previously completed)
            const isCurrentPath = pathIndex === currentSegmentIndex;
            const isCompletedPath = pathIndex < currentSegmentIndex;
            const shouldShowPath = isCurrentPath || isCompletedPath;
            
            if (!shouldShowPath) return null; // Hide future paths
            
            return (
              <g key={path.id}>
                {/* Base path */}
                <path
                  d={pathData}
                  stroke={path.color || tourData.settings.theme.path.color}
                  strokeWidth={path.width || tourData.settings.theme.path.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isCompletedPath ? 0.6 : 1}
                />
                
                {/* Progress indicator on current path */}
                {isCurrentPath && (
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
                {showPOILabels && (
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
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div
            className="relative max-w-full max-h-full"
            style={{
              aspectRatio: `${backgroundImage.width} / ${backgroundImage.height}`,
            }}
          >
            <div
              style={{
                width: backgroundImage.width,
                height: backgroundImage.height,
                transform: 'scale(1)',
                transformOrigin: 'center',
              }}
            >
              {canvasContent}
            </div>
          </div>
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
        centerOnInit={!isMobile}
        centerZoomedOut={!isMobile}
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