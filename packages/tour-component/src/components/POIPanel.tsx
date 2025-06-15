import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Info } from 'lucide-react';
import { POI } from '@site-tour-tools/shared';

interface POIPanelProps {
  poi: POI | null;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const POIPanel: React.FC<POIPanelProps> = ({
  poi,
  isVisible,
  onClose,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isVisible && poi && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`bg-white rounded-lg shadow-xl border border-gray-200 ${className}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <MapPin size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {poi.label}
                </h3>
                <p className="text-sm text-gray-500">
                  Point of Interest
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {poi.description ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {poi.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No additional information available for this POI.
                </p>
              </div>
            )}

            {/* Metadata */}
            {poi.metadata && Object.keys(poi.metadata).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Additional Information
                </h4>
                <div className="space-y-2">
                  {Object.entries(poi.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/[_-]/g, ' ')}:
                      </span>
                      <span className="text-sm text-gray-900 font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Position Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Position:</span>
                <span className="text-sm text-gray-900 font-mono">
                  ({Math.round(poi.position.x)}, {Math.round(poi.position.y)})
                </span>
              </div>
              {poi.isConnected !== undefined && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Connected to Path:</span>
                  <span className={`text-sm font-medium ${
                    poi.isConnected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {poi.isConnected ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
            >
              Continue Tour
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default POIPanel;