import React from 'react';
import { motion } from 'framer-motion';
import { useTourStore } from '../store/tourStore';
import { POI } from '@site-tour-tools/shared';

interface TourCanvasProps {
  className?: string;
  showPOILabels?: boolean;
  onPOIClick?: (poi: POI) => void;
}

const TourCanvas: React.FC<TourCanvasProps> = ({ 
  className = '',
  showPOILabels = true,
  onPOIClick 
}) => {
  const {
    tourData,
    currentPoint,
    activePOI,
    visitedPOIs,
    progress,
  } = useTourStore();

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

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <img
        src={backgroundImage.url}
        alt="Tour background"
        className="w-full h-full object-contain"
        draggable={false}
      />

      {/* SVG Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${backgroundImage.width} ${backgroundImage.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render paths */}
        <g className="paths">
          {paths.map((path, pathIndex) => {
            const pathLength = path.points.length;
            if (pathLength < 2) return null;

            const pathData = `M ${path.points[0].x} ${path.points[0].y} ` +
              path.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

            // Calculate if this path should be highlighted based on progress
            const isActivePath = pathIndex <= Math.floor(progress * paths.length);
            
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
                  opacity={isActivePath ? 1 : 0.3}
                />
                
                {/* Progress indicator on active path */}
                {isActivePath && (
                  <motion.path
                    d={pathData}
                    stroke={tourData.settings.theme.path.activeColor}
                    strokeWidth={(path.width || tourData.settings.theme.path.width) + 2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ 
                      pathLength: pathIndex === Math.floor(progress * paths.length) 
                        ? (progress * paths.length) % 1 
                        : 1 
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
};

export default TourCanvas;