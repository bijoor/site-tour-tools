import React, { useRef, useCallback, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useDrawingStore } from '../store/drawingStore';
import { findNearestPOI } from '@site-tour-tools/shared';
import { useMobileDetection } from '../hooks/useMobileDetection';
import POILayer from './POILayer';
import PathLayer from './PathLayer';

const Canvas: React.FC = () => {
  const {
    mode,
    backgroundImage,
    backgroundDimensions,
    tourData,
    currentPath,
    isDrawing,
    snapDistance,
    zoom,
    pan,
    addPOI,
    startPath,
    addPathPoint,
    completePath,
    setZoom,
    setPan,
  } = useDrawingStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const { isTouchDevice, hasCoarsePointer } = useMobileDetection();
  const [currentTransform, setCurrentTransform] = useState({ scale: 1, positionX: 0, positionY: 0 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTransformTime, setLastTransformTime] = useState(0);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!backgroundDimensions || !tourData) return;

    // Check if we're currently dragging
    if (isDragging) {
      console.log('Ignoring click during drag operation');
      return;
    }

    // Check if we're currently dragging by looking at recent transform changes
    const now = Date.now();
    if (now - lastTransformTime < 150) {
      console.log('Ignoring click due to recent transform');
      return;
    }

    // Simple debouncing to avoid rapid clicks during pan gestures
    if (now - lastClickTime < 100) {
      console.log('Ignoring rapid click');
      return;
    }
    setLastClickTime(now);

    // Get the image element
    const imageElement = canvasRef.current?.querySelector('img');
    if (!imageElement) return;

    const imageRect = imageElement.getBoundingClientRect();
    
    // Get click coordinates relative to the image
    const imageX = event.clientX - imageRect.left;
    const imageY = event.clientY - imageRect.top;

    // Convert from image display coordinates to actual image coordinates
    // The image might be scaled to fit the container, so we need to account for that
    const scaleX = backgroundDimensions.width / imageRect.width;
    const scaleY = backgroundDimensions.height / imageRect.height;
    
    const x = imageX * scaleX;
    const y = imageY * scaleY;

    console.log('Click coordinates:', {
      client: { x: event.clientX, y: event.clientY },
      imageRelative: { x: imageX, y: imageY },
      imageRect: { width: imageRect.width, height: imageRect.height },
      backgroundDimensions,
      scale: { x: scaleX, y: scaleY },
      final: { x, y }
    });

    if (mode === 'poi') {
      const label = `POI ${tourData.pois.length + 1}`;
      addPOI({ x, y }, label);
    } else if (mode === 'path') {
      if (!isDrawing) {
        startPath({ x, y });
      } else {
        // Check for POI snapping
        const nearestPOI = findNearestPOI(
          { x, y },
          tourData.pois,
          snapDistance
        );

        const pointToAdd = nearestPOI ? nearestPOI.position : { x, y };
        const connectedPOI = nearestPOI?.id;

        addPathPoint(pointToAdd, connectedPOI);
      }
    }
  }, [
    mode,
    backgroundDimensions,
    tourData,
    isDrawing,
    snapDistance,
    addPOI,
    startPath,
    addPathPoint,
    lastClickTime,
  ]);

  const handleDoubleClick = useCallback(() => {
    if (mode === 'path' && isDrawing) {
      completePath();
    }
  }, [mode, isDrawing, completePath]);

  const handleTransformChange = useCallback((_ref: any, state: any) => {
    console.log('Transform changed:', {
      scale: state.scale,
      positionX: state.positionX,
      positionY: state.positionY
    });
    
    // Update timestamp to track when transforms are happening
    setLastTransformTime(Date.now());
    
    // Only update our local state for coordinate calculations
    setCurrentTransform({
      scale: state.scale,
      positionX: state.positionX,
      positionY: state.positionY
    });
  }, []);

  const handlePanningStart = useCallback(() => {
    console.log('Panning started');
    setIsDragging(true);
  }, []);

  const handlePanningStop = useCallback(() => {
    console.log('Panning stopped');
    setIsDragging(false);
  }, []);


  if (!backgroundImage || !backgroundDimensions) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Background Image
          </h3>
          <p className="text-gray-600">
            Load an image to start creating your tour
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        centerOnInit={false}
        onTransformed={handleTransformChange}
        onPanningStart={handlePanningStart}
        onPanningStop={handlePanningStop}
        wheel={{ disabled: isTouchDevice }}
        pinch={{ disabled: !isTouchDevice }}
        doubleClick={{ disabled: true }}
        limitToBounds={false}
        centerZoomedOut={false}
        panning={{
          disabled: false,
          velocityEqualToMove: false,
          lockAxisX: false,
          lockAxisY: false
        }}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass={`canvas-container ${mode}-mode`}
        >
          <div
            ref={canvasRef}
            className="relative inline-block"
            style={{
              width: backgroundDimensions.width,
              height: backgroundDimensions.height,
            }}
          >
            {/* Background Image */}
            <img
              src={backgroundImage}
              alt="Tour background"
              className="block w-full h-full object-contain pointer-events-none"
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
              }}
            />

            {/* Click overlay - only active when not in pan mode */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                pointerEvents: mode === 'select' ? 'none' : 'auto',
                zIndex: 10
              }}
              onClick={handleCanvasClick}
              onDoubleClick={handleDoubleClick}
            />

            {/* SVG Overlay for drawing */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${backgroundDimensions.width} ${backgroundDimensions.height}`}
            >
              {/* Render existing paths */}
              {tourData && (
                <PathLayer
                  paths={tourData.paths}
                  currentPath={currentPath}
                  isDrawing={isDrawing}
                />
              )}

              {/* Render POIs */}
              {tourData && (
                <POILayer
                  pois={tourData.pois}
                  snapDistance={snapDistance}
                  mode={mode}
                />
              )}
            </svg>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Drawing Instructions */}
      {mode === 'path' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
          {!isDrawing ? (
            'Click to start drawing a path'
          ) : (
            'Click to add points, double-click to finish'
          )}
        </div>
      )}

      {mode === 'poi' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
          Click to place a POI
        </div>
      )}
    </div>
  );
};

export default Canvas;