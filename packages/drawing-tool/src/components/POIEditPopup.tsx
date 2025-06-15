import React, { useState, useEffect } from 'react';
import { X, MapPin, Trash2, Save } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { POI } from '@site-tour-tools/shared';

const POIEditPopup: React.FC = () => {
  const {
    selectedPOI,
    tourData,
    updatePOI,
    deletePOI,
    selectPOI,
  } = useDrawingStore();

  const [label, setLabel] = useState('');

  const poi = tourData?.pois.find(p => p.id === selectedPOI);

  useEffect(() => {
    if (poi) {
      setLabel(poi.label);
    }
  }, [poi]);

  if (!selectedPOI || !poi) {
    return null;
  }

  const handleSave = () => {
    if (label.trim() && label !== poi.label) {
      updatePOI(poi.id, { label: label.trim() });
    }
    selectPOI(undefined); // Close popup
  };

  const handleDelete = () => {
    if (confirm(`Delete POI "${poi.label}"?`)) {
      deletePOI(poi.id);
      selectPOI(undefined); // Close popup
    }
  };

  const handleCancel = () => {
    selectPOI(undefined); // Close popup
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
            <MapPin size={20} className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Edit POI
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

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Position: ({Math.round(poi.position.x)}, {Math.round(poi.position.y)})</div>
              <div>Connected: {poi.isConnected ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>

          <div className="flex space-x-3">
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
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIEditPopup;