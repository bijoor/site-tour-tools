import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { calculateDistance } from '@site-tour-tools/shared';

const POIAssociationDialog: React.FC = () => {
  console.log('🔍 POIAssociationDialog: Component rendering');
  
  const {
    showPOIAssociationDialog,
    currentPath,
    tourData,
    completePathWithPOI,
    hidePOIDialog,
  } = useDrawingStore();

  console.log('🔍 POIAssociationDialog: Store values:', {
    showPOIAssociationDialog,
    currentPathLength: currentPath?.length,
    tourDataExists: !!tourData
  });

  // State must be declared before any early returns (Rules of Hooks)
  const [selectedStartPOI, setSelectedStartPOI] = useState<string | undefined>(undefined);
  const [selectedEndPOI, setSelectedEndPOI] = useState<string | undefined>(undefined);

  console.log('🔍 POIAssociationDialog: State initialized');

  // Simplified useEffect to debug the issue
  useEffect(() => {
    console.log('🔍 POIAssociationDialog: useEffect running with:', {
      showPOIAssociationDialog,
      currentPathExists: !!currentPath,
      currentPathLength: currentPath?.length
    });
    
    try {
      if (showPOIAssociationDialog && currentPath && currentPath.length > 0) {
        const detectedStartPOI = currentPath[0]?.connectedPOI;
        console.log('🔍 POIAssociationDialog: Setting start POI to:', detectedStartPOI);
        setSelectedStartPOI(detectedStartPOI);
        setSelectedEndPOI(undefined);
      }
    } catch (error) {
      console.error('🚨 POIAssociationDialog: Error in useEffect:', error);
    }
  }, [showPOIAssociationDialog]);

  console.log('🔍 POIAssociationDialog: About to check early return conditions');

  if (!showPOIAssociationDialog || !currentPath || !tourData) {
    console.log('🔍 POIAssociationDialog: Early return triggered');
    return null;
  }

  console.log('🔍 POIAssociationDialog: Proceeding with render');

  // Get the start and endpoint of the current path
  const pathStartpoint = currentPath[0];
  const pathEndpoint = currentPath[currentPath.length - 1];
  
  // Auto-detect if first point is already connected to a POI
  const autoDetectedStartPOI = pathStartpoint?.connectedPOI;

  // Find nearby POIs for start point (within 100 pixels)
  const nearbyStartPOIs = tourData.pois.filter(poi => {
    const distance = calculateDistance(pathStartpoint, poi.position);
    return distance <= 100;
  });

  // Find nearby POIs for end point (within 100 pixels)
  const nearbyEndPOIs = tourData.pois.filter(poi => {
    const distance = calculateDistance(pathEndpoint, poi.position);
    return distance <= 100;
  });

  const handleConfirm = () => {
    console.log('🔍 POIAssociationDialog: handleConfirm called with:', {
      selectedStartPOI,
      selectedEndPOI
    });
    
    try {
      console.log('🔍 POIAssociationDialog: Calling completePathWithPOI');
      completePathWithPOI(selectedEndPOI, selectedStartPOI);
      console.log('🔍 POIAssociationDialog: completePathWithPOI successful');
    } catch (error) {
      console.error('🚨 POIAssociationDialog: Error completing path:', error);
      // Still hide dialog to prevent stuck state
      hidePOIDialog();
    }
  };

  const handleCancel = () => {
    hidePOIDialog();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Associate Path with POIs
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Associate this path with starting and ending POIs for interactive navigation.
        </p>

        <div className="space-y-6 mb-6">
          {/* Start POI Section */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <div className="flex items-center">
                <MapPin size={16} className="text-green-500 mr-2" />
                <span>Start POI</span>
                {autoDetectedStartPOI && <span className="text-xs text-green-600 ml-2">(auto-detected)</span>}
              </div>
            </label>
            <select
              value={selectedStartPOI || ''}
              onChange={(e) => setSelectedStartPOI(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">None (path doesn't start from a POI)</option>
              {tourData.pois.map(poi => {
                const distance = Math.round(calculateDistance(pathStartpoint, poi.position));
                const isNearby = distance <= 100;
                return (
                  <option key={poi.id} value={poi.id}>
                    {poi.label} ({distance}px away{isNearby ? ' - nearby' : ''})
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select which POI this path starts from for interactive navigation.
            </p>
          </div>

          {/* End POI Section */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <div className="flex items-center">
                <MapPin size={16} className="text-blue-500 mr-2" />
                <span>End POI</span>
              </div>
            </label>
            <select
              value={selectedEndPOI || ''}
              onChange={(e) => setSelectedEndPOI(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None (path doesn't end at a POI)</option>
              {tourData.pois.map(poi => {
                const distance = Math.round(calculateDistance(pathEndpoint, poi.position));
                const isNearby = distance <= 100;
                return (
                  <option key={poi.id} value={poi.id}>
                    {poi.label} ({distance}px away{isNearby ? ' - nearby' : ''})
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select which POI this path ends at to mark it as visited when the path completes.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Complete Path
          </button>
        </div>
      </div>
    </div>
  );
};

export default POIAssociationDialog;