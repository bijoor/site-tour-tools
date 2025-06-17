import React, { useState, useEffect } from 'react';
import { X, MapPin, Trash2, Save, Plus } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { POI } from '@site-tour-tools/shared';

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
  } = useDrawingStore();

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [showLabel, setShowLabel] = useState(true);

  const isCreating = selectedPOI === 'pending' && pendingPOI;
  const poi = isCreating ? null : tourData?.pois.find(p => p.id === selectedPOI);

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