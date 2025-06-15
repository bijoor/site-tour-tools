import React from 'react';
import { PathSegment, PathPoint } from '@site-tour-tools/shared';
import { useDrawingStore } from '../store/drawingStore';

interface PathLayerProps {
  paths: PathSegment[];
  currentPath: PathPoint[] | null;
  isDrawing: boolean;
}

const PathLayer: React.FC<PathLayerProps> = ({ paths, currentPath, isDrawing }) => {
  const { selectedPath, selectPath, deletePath, mode } = useDrawingStore();

  const handlePathClick = (path: PathSegment, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (mode === 'select') {
      selectPath(selectedPath === path.id ? undefined : path.id);
    }
  };

  const handleDeleteClick = (path: PathSegment, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Delete this path?')) {
      deletePath(path.id);
    }
  };

  const renderPath = (points: PathPoint[], color: string, width: number, style?: string) => {
    if (points.length < 2) return null;

    const pathData = `M ${points[0].x} ${points[0].y} ` +
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    const strokeDasharray = style === 'dashed' ? '8,4' : 
                           style === 'dotted' ? '2,2' : undefined;

    return (
      <path
        d={pathData}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={strokeDasharray}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="path-line"
      />
    );
  };

  const renderPathPoints = (points: PathPoint[], isCurrentPath = false) => {
    return points.map((point, index) => (
      <g key={point.id || index}>
        {/* Path point */}
        <circle
          cx={point.x}
          cy={point.y}
          r={isCurrentPath ? 4 : 3}
          fill={point.connectedPOI ? '#10b981' : '#6b7280'}
          stroke="#ffffff"
          strokeWidth={1}
          className="path-point"
        />
        
        {/* First point indicator */}
        {index === 0 && (
          <circle
            cx={point.x}
            cy={point.y}
            r={6}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            className="pointer-events-none"
          />
        )}
        
        {/* Last point indicator */}
        {index === points.length - 1 && points.length > 1 && (
          <polygon
            points={`${point.x},${point.y - 6} ${point.x - 5},${point.y + 4} ${point.x + 5},${point.y + 4}`}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={1}
            className="pointer-events-none"
          />
        )}
      </g>
    ));
  };

  return (
    <g className="path-layer">
      {/* Existing paths */}
      {paths.map((path) => {
        const isSelected = selectedPath === path.id;
        
        return (
          <g key={path.id} className="path-group">
            {/* Main path line */}
            <g
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handlePathClick(path, e)}
            >
              {renderPath(
                path.points,
                isSelected ? '#1d4ed8' : (path.color || '#3b82f6'),
                isSelected ? (path.width || 3) + 2 : (path.width || 3),
                path.style
              )}
            </g>
            
            {/* Path points (only show when selected) */}
            {isSelected && renderPathPoints(path.points)}
            
            {/* Selection highlight */}
            {isSelected && (
              <>
                {/* Highlight overlay */}
                {renderPath(
                  path.points,
                  '#3b82f6',
                  (path.width || 3) + 6,
                  undefined
                )}
                
                {/* Delete button at path center */}
                {path.points.length >= 2 && (() => {
                  const midIndex = Math.floor(path.points.length / 2);
                  const midPoint = path.points[midIndex];
                  
                  return (
                    <g
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => handleDeleteClick(path, e)}
                    >
                      <circle
                        cx={midPoint.x}
                        cy={midPoint.y}
                        r={10}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <text
                        x={midPoint.x}
                        y={midPoint.y + 3}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#ffffff"
                        fontWeight="bold"
                      >
                        ×
                      </text>
                    </g>
                  );
                })()}
              </>
            )}
          </g>
        );
      })}
      
      {/* Current path being drawn */}
      {isDrawing && currentPath && currentPath.length > 0 && (
        <g className="current-path">
          {currentPath.length > 1 && renderPath(
            currentPath,
            '#f59e0b',
            3,
            'dashed'
          )}
          
          {renderPathPoints(currentPath, true)}
        </g>
      )}
    </g>
  );
};

export default PathLayer;