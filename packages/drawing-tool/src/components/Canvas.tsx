import React, { useRef, useCallback, useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useDrawingStore } from '../store/drawingStore';
import { findNearestPOI, generatePOIId } from '@site-tour-tools/shared';
import { useMobileDetection } from '../hooks/useMobileDetection';
import POILayer from './POILayer';
import PathLayer from './PathLayer';
import POIAssociationDialog from './POIAssociationDialog';
import POIEditPopup from './POIEditPopup';
import PathEditPopup from './PathEditPopup';

const Canvas: React.FC = () => {
  const {
    mode,
    backgroundImage,
    backgroundDimensions,
    tourData,
    currentPath,
    isDrawing,
    snapDistance,
    startPOICreation,
    startPath,
    addPathPoint,
    completePath,
  } = useDrawingStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const { isTouchDevice } = useMobileDetection();
  const [, setCurrentTransform] = useState({ scale: 1, positionX: 0, positionY: 0 });
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTransformTime, setLastTransformTime] = useState(0);

  // Auto-fit image to viewport when image loads
  useEffect(() => {
    if (backgroundDimensions && transformRef.current && wrapperRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (transformRef.current && wrapperRef.current) {
          const wrapper = wrapperRef.current;
          const rect = wrapper.getBoundingClientRect();
          
          // Calculate the scale needed to fit the image in the viewport
          const scaleX = rect.width / backgroundDimensions.width;
          const scaleY = rect.height / backgroundDimensions.height;
          const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding
          
          transformRef.current.setTransform(
            (rect.width - backgroundDimensions.width * scale) / 2,
            (rect.height - backgroundDimensions.height * scale) / 2,
            scale
          );
        }
      }, 100);
    }
  }, [backgroundDimensions]);

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
      // Directly create POI with default values instead of showing dialog first
      const state = useDrawingStore.getState();
      if (!state.tourData) return;
      
      const defaultLabel = `POI ${(state.tourData.pois.length || 0) + 1}`;
      const newPOI = {
        id: generatePOIId(),
        position: { x, y },
        label: defaultLabel,
        description: undefined,
        showLabel: false, // Default to false as requested
        isConnected: false,
      };
      
      const updatedTourData = {
        ...state.tourData,
        pois: [...state.tourData.pois, newPOI],
        updatedAt: new Date().toISOString(),
      };
      
      useDrawingStore.setState({ 
        tourData: updatedTourData,
        selectedPOI: newPOI.id // Select the newly created POI for editing
      });
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
    startPOICreation,
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
    <div ref={wrapperRef} className="relative w-full h-full overflow-hidden bg-gray-50">
      <TransformWrapper
        ref={transformRef}
        key={backgroundImage}
        initialScale={1}
        minScale={0.1}
        maxScale={5}
        centerOnInit={true}
        centerZoomedOut={true}
        onTransformed={handleTransformChange}
        onPanningStart={handlePanningStart}
        onPanningStop={handlePanningStop}
        wheel={{ disabled: isTouchDevice }}
        pinch={{ disabled: !isTouchDevice }}
        doubleClick={{ disabled: true }}
        limitToBounds={false}
        panning={{
          disabled: false,
          lockAxisX: false,
          lockAxisY: false
        }}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full"
        >
          <div
            ref={canvasRef}
            className="relative block"
            style={{
              width: backgroundDimensions.width,
              height: backgroundDimensions.height,
            }}
          >
            {/* Background Image */}
            <img
              src={backgroundImage}
              alt="Tour background"
              className="block pointer-events-none"
              draggable={false}
              style={{
                width: backgroundDimensions.width,
                height: backgroundDimensions.height,
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

      {/* POI Association Dialog */}
      <POIAssociationDialog />

      {/* Edit Popups */}
      <POIEditPopup />
      <PathEditPopup />
    </div>
  );
};

export default Canvas;