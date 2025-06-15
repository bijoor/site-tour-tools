import React from 'react';
import { POI } from '@site-tour-tools/shared';
import { useDrawingStore } from '../store/drawingStore';

interface POILayerProps {
  pois: POI[];
  snapDistance: number;
  mode: 'poi' | 'path' | 'select';
}

const POILayer: React.FC<POILayerProps> = ({ pois, mode }) => {
  const { selectedPOI, selectPOI, deletePOI } = useDrawingStore();

  const handlePOIClick = (poi: POI, event: React.MouseEvent) => {
    console.log('POI clicked:', {
      poiId: poi.id,
      poiPosition: poi.position,
      currentlySelected: selectedPOI,
      mode,
      event: { x: event.clientX, y: event.clientY }
    });
    
    event.stopPropagation();
    
    if (mode === 'select') {
      const newSelection = selectedPOI === poi.id ? undefined : poi.id;
      console.log('Selecting POI:', newSelection);
      selectPOI(newSelection);
    }
  };

  const handlePOIMouseEnter = (poi: POI) => {
    console.log('POI mouse enter:', poi.id, poi.position);
  };

  const handlePOIMouseLeave = (poi: POI) => {
    console.log('POI mouse leave:', poi.id);
  };

  const handlePOIDoubleClick = (poi: POI, event: React.MouseEvent) => {
    event.stopPropagation();
    // Double-click functionality removed - now handled by popup
  };

  return (
    <g className="poi-layer">
      {pois.map((poi) => {
        const isSelected = selectedPOI === poi.id;
        const isConnected = poi.isConnected;
        
        return (
          <g key={poi.id} className="poi-group">

            {/* POI Circle - keep consistent size to avoid flickering */}
            <circle
              cx={poi.position.x}
              cy={poi.position.y}
              r={10}
              fill={isConnected ? '#10b981' : '#ef4444'}
              stroke={isSelected ? "#3b82f6" : "#ffffff"}
              strokeWidth={isSelected ? 3 : 2}
              className="poi-marker pointer-events-auto cursor-pointer"
              style={{ 
                pointerEvents: mode === 'select' ? 'auto' : 'none'
              }}
              onClick={(e) => handlePOIClick(poi, e)}
              onDoubleClick={(e) => handlePOIDoubleClick(poi, e)}
              onMouseEnter={() => handlePOIMouseEnter(poi)}
              onMouseLeave={() => handlePOIMouseLeave(poi)}
            />
            
            {/* Connection indicator */}
            {isConnected && (
              <circle
                cx={poi.position.x}
                cy={poi.position.y}
                r={4}
                fill="#ffffff"
                className="pointer-events-none"
              />
            )}
            
            {/* POI Label - positioned further away to avoid overlap */}
            <text
              x={poi.position.x}
              y={poi.position.y - 20}
              textAnchor="middle"
              fontSize="12"
              fill="#1f2937"
              fontWeight="500"
              className="pointer-events-none select-none"
              style={{ 
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                pointerEvents: 'none'
              }}
            >
              {poi.label}
            </text>
            
          </g>
        );
      })}
    </g>
  );
};

export default POILayer;