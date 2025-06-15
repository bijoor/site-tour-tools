import React, { useState, useEffect } from 'react';
import { X, Route, Trash2, Save, MapPin } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';

const PathEditPopup: React.FC = () => {
  const {
    selectedPath,
    tourData,
    updatePath,
    deletePath,
    selectPath,
  } = useDrawingStore();

  const [endPOI, setEndPOI] = useState<string | undefined>(undefined);

  const path = tourData?.paths.find(p => p.id === selectedPath);

  useEffect(() => {
    if (path) {
      setEndPOI(path.endPOI);
    }
  }, [path]);

  if (!selectedPath || !path || !tourData) {
    return null;
  }

  const handleSave = () => {
    // Update path with new endPOI
    updatePath(path.id, {
      endPOI: endPOI || undefined,
    });
    selectPath(undefined); // Close popup
  };

  const handleDelete = () => {
    if (confirm('Delete this path?')) {
      deletePath(path.id);
      selectPath(undefined); // Close popup
    }
  };

  const handleCancel = () => {
    selectPath(undefined); // Close popup
  };

  const availablePOIs = tourData.pois;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Route size={20} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Path
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
              End Point Association
            </label>
            <select
              value={endPOI || ''}
              onChange={(e) => setEndPOI(e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">None (path doesn't end at a POI)</option>
              {availablePOIs.map(poi => (
                <option key={poi.id} value={poi.id}>
                  {poi.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Associate this path's endpoint with a POI to mark it as visited when the path completes.
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Points: {path.points.length}</div>
              <div>Start: ({Math.round(path.points[0]?.x || 0)}, {Math.round(path.points[0]?.y || 0)})</div>
              <div>End: ({Math.round(path.points[path.points.length - 1]?.x || 0)}, {Math.round(path.points[path.points.length - 1]?.y || 0)})</div>
              {endPOI && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <MapPin size={12} />
                  <span>Ends at: {availablePOIs.find(p => p.id === endPOI)?.label}</span>
                </div>
              )}
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

export default PathEditPopup;