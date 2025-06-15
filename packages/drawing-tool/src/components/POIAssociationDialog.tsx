import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { calculateDistance } from '@site-tour-tools/shared';

const POIAssociationDialog: React.FC = () => {
  const {
    showPOIAssociationDialog,
    currentPath,
    tourData,
    completePathWithPOI,
    hidePOIDialog,
  } = useDrawingStore();

  const [selectedPOI, setSelectedPOI] = useState<string | undefined>(undefined);

  if (!showPOIAssociationDialog || !currentPath || !tourData) {
    return null;
  }

  // Get the endpoint of the current path
  const pathEndpoint = currentPath[currentPath.length - 1];

  // Find nearby POIs (within 100 pixels of path endpoint)
  const nearbyPOIs = tourData.pois.filter(poi => {
    const distance = calculateDistance(pathEndpoint, poi.position);
    return distance <= 100;
  });

  const handleConfirm = () => {
    completePathWithPOI(selectedPOI);
  };

  const handleCancel = () => {
    hidePOIDialog();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Associate Path with POI
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Does this path end at a Point of Interest? Select one below or choose "None" if this path doesn't end at a POI.
        </p>

        <div className="space-y-2 mb-6">
          {/* None option */}
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="endPOI"
              value=""
              checked={selectedPOI === undefined}
              onChange={() => setSelectedPOI(undefined)}
              className="mr-3"
            />
            <span className="text-gray-700">None (path doesn't end at a POI)</span>
          </label>

          {/* Nearby POIs */}
          {nearbyPOIs.map(poi => {
            const distance = Math.round(calculateDistance(pathEndpoint, poi.position));
            return (
              <label
                key={poi.id}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="endPOI"
                  value={poi.id}
                  checked={selectedPOI === poi.id}
                  onChange={() => setSelectedPOI(poi.id)}
                  className="mr-3"
                />
                <MapPin size={16} className="text-red-500 mr-2" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{poi.label}</div>
                  <div className="text-xs text-gray-500">{distance}px away</div>
                </div>
              </label>
            );
          })}

          {/* All other POIs if no nearby ones */}
          {nearbyPOIs.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                No POIs found near the path endpoint.
              </p>
              <p className="text-xs text-gray-400">
                You can still associate with any POI below:
              </p>
            </div>
          )}

          {/* Show all POIs if none are nearby, or if user wants to see all */}
          {(nearbyPOIs.length === 0 || tourData.pois.length <= 5) && 
            tourData.pois
              .filter(poi => !nearbyPOIs.includes(poi))
              .map(poi => (
                <label
                  key={poi.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="endPOI"
                    value={poi.id}
                    checked={selectedPOI === poi.id}
                    onChange={() => setSelectedPOI(poi.id)}
                    className="mr-3"
                  />
                  <MapPin size={16} className="text-red-500 mr-2" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{poi.label}</div>
                  </div>
                </label>
              ))
          }
        </div>

        <div className="flex justify-end space-x-3">
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