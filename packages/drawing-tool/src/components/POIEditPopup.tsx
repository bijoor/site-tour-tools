import React, { useState, useEffect } from 'react';
import { X, MapPin, Trash2, Save, Plus, Route } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { POI, PathSegment } from '@site-tour-tools/shared';

const POIEditPopup: React.FC = () => {
  const {
    selectedPOI,
    tourData,
    pendingPOI,
    updatePOI,
    deletePOI,
    selectPOI,
    createPOI,
    cancelPOICreation,
    updatePath,
  } = useDrawingStore();

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [showLabel, setShowLabel] = useState(true);

  const isCreating = selectedPOI === 'pending' && pendingPOI;
  const poi = isCreating ? null : tourData?.pois.find(p => p.id === selectedPOI);

  // Find paths connected to this POI
  const connectedPaths = poi && tourData ? tourData.paths.filter(path => {
    // Check if POI is connected through path points, startPOI, or endPOI
    const isConnectedThroughPoints = path.points.some(point => point.connectedPOI === poi.id);
    const isStartPOI = path.startPOI === poi.id;
    const isEndPOI = path.endPOI === poi.id;
    return isConnectedThroughPoints || isStartPOI || isEndPOI;
  }) : [];

  // Find paths that could potentially start from this POI (paths that are connected but don't have startPOI set)
  const availableStartPaths = poi && tourData ? tourData.paths.filter(path => {
    const isConnectedThroughPoints = path.points.some(point => point.connectedPOI === poi.id);
    const hasNoStartPOI = !path.startPOI;
    return isConnectedThroughPoints && hasNoStartPOI;
  }) : [];

  useEffect(() => {
    if (isCreating) {
      // Set defaults for new POI
      const defaultLabel = `POI ${(tourData?.pois.length || 0) + 1}`;
      setLabel(defaultLabel);
      setDescription('');
      setShowLabel(false);
    } else if (poi) {
      // Set values for existing POI
      setLabel(poi.label);
      setDescription(poi.description || '');
      setShowLabel(poi.showLabel ?? true);
    }
  }, [poi, isCreating, tourData?.pois.length]);

  if (!selectedPOI || (!poi && !isCreating)) {
    return null;
  }

  const handleSave = () => {
    if (!label.trim()) return;

    if (isCreating) {
      // Create new POI
      createPOI(label.trim(), description.trim() || undefined, showLabel);
    } else if (poi) {
      // Update existing POI
      const updates: Partial<POI> = {};
      if (label.trim() !== poi.label) updates.label = label.trim();
      if ((description.trim() || undefined) !== poi.description) updates.description = description.trim() || undefined;
      if (showLabel !== (poi.showLabel ?? true)) updates.showLabel = showLabel;
      
      if (Object.keys(updates).length > 0) {
        updatePOI(poi.id, updates);
      }
      selectPOI(undefined); // Close popup
    }
  };

  const handleDelete = () => {
    if (!poi) return;
    if (confirm(`Delete POI "${poi.label}"?`)) {
      deletePOI(poi.id);
      selectPOI(undefined); // Close popup
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      cancelPOICreation();
    } else {
      selectPOI(undefined); // Close popup
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSetStartPOI = (pathId: string) => {
    if (!poi) return;
    updatePath(pathId, { startPOI: poi.id });
  };

  const handleRemoveStartPOI = (pathId: string) => {
    updatePath(pathId, { startPOI: undefined });
  };

  const getPathDisplayName = (path: PathSegment) => {
    if (path.endPOI) {
      const endPOI = tourData?.pois.find(p => p.id === path.endPOI);
      return `Path to ${endPOI?.label || 'Unknown POI'}`;
    }
    return `Path ${path.id.slice(-8)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isCreating ? (
              <Plus size={20} className="text-blue-500" />
            ) : (
              <MapPin size={20} className="text-red-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {isCreating ? 'Create POI' : 'Edit POI'}
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              POI Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter POI name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showLabel}
                onChange={(e) => setShowLabel(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show label on image
              </span>
            </label>
          </div>

          {/* Path Management Section - only show for existing POIs */}
          {!isCreating && poi && connectedPaths.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-1">
                  <Route size={16} />
                  <span>Connected Paths</span>
                </div>
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {connectedPaths.map((path) => (
                  <div key={path.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {getPathDisplayName(path)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {path.startPOI === poi.id ? 'Starts here' : path.endPOI === poi.id ? 'Ends here' : 'Connected'}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {path.startPOI === poi.id ? (
                        <button
                          onClick={() => handleRemoveStartPOI(path.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Remove as start POI"
                        >
                          Remove Start
                        </button>
                      ) : !path.startPOI ? (
                        <button
                          onClick={() => handleSetStartPOI(path.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="Set as start POI for this path"
                        >
                          Set Start
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Has Start</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {availableStartPaths.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Tip: Click "Set Start" to make this POI the starting point for interactive navigation
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-500 space-y-1">
              {isCreating && pendingPOI ? (
                <div>Position: ({Math.round(pendingPOI.position.x)}, {Math.round(pendingPOI.position.y)})</div>
              ) : poi ? (
                <>
                  <div>Position: ({Math.round(poi.position.x)}, {Math.round(poi.position.y)})</div>
                  <div>Connected: {poi.isConnected ? 'Yes' : 'No'}</div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          {!isCreating && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}

          <div className={`flex space-x-3 ${isCreating ? 'ml-auto' : ''}`}>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <Plus size={16} />
                  <span>Create</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIEditPopup;