import React, { useState } from 'react';
import { MapPin, Route, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { POI } from '@site-tour-tools/shared';

const Sidebar: React.FC = () => {
  const {
    tourData,
    selectedPOI,
    selectedPath,
    selectPOI,
    selectPath,
    updatePOI,
    deletePOI,
    deletePath,
  } = useDrawingStore();

  const [editingPOI, setEditingPOI] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  if (!tourData) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">No Tour Data</h3>
          <p className="text-sm">Load an image and create a tour to get started</p>
        </div>
      </div>
    );
  }

  const handlePOIEdit = (poi: POI) => {
    setEditingPOI(poi.id);
    setEditingLabel(poi.label);
    setEditingDescription(poi.description || '');
  };

  const handlePOISave = (poiId: string) => {
    updatePOI(poiId, {
      label: editingLabel,
      description: editingDescription || undefined,
    });
    setEditingPOI(null);
  };

  const handlePOICancel = () => {
    setEditingPOI(null);
    setEditingLabel('');
    setEditingDescription('');
  };

  const handlePOISelect = (poiId: string) => {
    selectPOI(selectedPOI === poiId ? undefined : poiId);
  };

  const handlePathSelect = (pathId: string) => {
    selectPath(selectedPath === pathId ? undefined : pathId);
  };

  const handlePOIDelete = (poiId: string, label: string) => {
    if (confirm(`Delete POI "${label}"?`)) {
      deletePOI(poiId);
    }
  };

  const handlePathDelete = (pathId: string) => {
    if (confirm('Delete this path?')) {
      deletePath(pathId);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{tourData.name}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {tourData.pois.length} POIs • {tourData.paths.length} Paths
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* POI Section */}
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <MapPin size={18} className="text-red-500" />
            <h3 className="font-medium text-gray-900">Points of Interest</h3>
            <span className="text-sm text-gray-500">({tourData.pois.length})</span>
          </div>

          {tourData.pois.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No POIs created yet</p>
          ) : (
            <div className="space-y-2">
              {tourData.pois.map((poi) => (
                <div
                  key={poi.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedPOI === poi.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {editingPOI === poi.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="POI Label"
                      />
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Description (optional)"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePOISave(poi.id)}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handlePOICancel}
                          className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handlePOISelect(poi.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                poi.isConnected ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span className="font-medium text-sm">{poi.label}</span>
                          </div>
                          {poi.description && (
                            <p className="text-xs text-gray-600 mt-1">{poi.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Position: ({Math.round(poi.position.x)}, {Math.round(poi.position.y)})
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handlePOISelect(poi.id)}
                            className="p-1 text-gray-400 hover:text-blue-500"
                            title="Select/View"
                          >
                            {selectedPOI === poi.id ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => handlePOIEdit(poi)}
                            className="p-1 text-gray-400 hover:text-yellow-500"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handlePOIDelete(poi.id, poi.label)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Path Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Route size={18} className="text-blue-500" />
            <h3 className="font-medium text-gray-900">Paths</h3>
            <span className="text-sm text-gray-500">({tourData.paths.length})</span>
          </div>

          {tourData.paths.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No paths created yet</p>
          ) : (
            <div className="space-y-2">
              {tourData.paths.map((path, index) => {
                const connectedPOIs = path.points
                  .filter(point => point.connectedPOI)
                  .map(point => {
                    const poi = tourData.pois.find(p => p.id === point.connectedPOI);
                    return poi?.label;
                  })
                  .filter(Boolean);

                return (
                  <div
                    key={path.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedPath === path.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePathSelect(path.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: path.color || '#3b82f6' }}
                          />
                          <span className="font-medium text-sm">Path {index + 1}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {path.points.length} points
                        </p>
                        {connectedPOIs.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Connected: {connectedPOIs.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePathSelect(path.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500"
                          title="Select/View"
                        >
                          {selectedPath === path.id ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePathDelete(path.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;