import React from 'react';
import { 
  MapPin, 
  Route, 
  MousePointer, 
  Download, 
  Upload, 
  Image,
  Save,
  Trash2,
  Menu
} from 'lucide-react';
import { useDrawingStore } from '../store/drawingStore';
import { useResponsive } from '../hooks/useResponsive';

interface ToolbarProps {
  onMenuClick?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onMenuClick }) => {
  const {
    mode,
    tourData,
    isDrawing,
    setMode,
    cancelPath,
    completePath,
    exportTour,
    importTour,
    setBackgroundImage,
    createNewTour,
    backgroundDimensions,
    setTourData,
  } = useDrawingStore();
  
  const { isMobile } = useResponsive();

  const handleModeChange = (newMode: 'poi' | 'path' | 'select') => {
    if (isDrawing && newMode !== 'path') {
      if (confirm('Cancel current path?')) {
        cancelPath();
        setMode(newMode);
      }
    } else {
      setMode(newMode);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('FileReader result length:', result?.length);
      
      const img = document.createElement('img');
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        setBackgroundImage(result, {
          width: img.width,
          height: img.height,
        });
        
        if (!tourData) {
          const tourName = prompt('Enter tour name:', 'New Tour');
          if (tourName) {
            createNewTour(tourName);
          }
        }
      };
      img.onerror = (error) => {
        console.error('Image failed to load:', error);
        alert('Failed to load image. Please try a different file.');
      };
      img.src = result;
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleExport = () => {
    if (!tourData) return;
    
    const data = exportTour();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tourData.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const tourData = JSON.parse(data);
        
        // Validate the tour data structure
        if (!tourData.id || !tourData.name || !tourData.backgroundImage) {
          throw new Error('Invalid tour data structure');
        }
        
        console.log('Importing tour:', tourData.name);
        console.log('Tour has:', tourData.pois?.length || 0, 'POIs and', tourData.paths?.length || 0, 'paths');
        
        // Import the tour data
        importTour(data);
        
        // Clear the file input
        event.target.value = '';
        
        alert(`Successfully loaded tour: "${tourData.name}"`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import tour data. Please check that the file is a valid tour JSON file.');
      }
    };
    reader.onerror = () => {
      alert('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleNewTour = () => {
    if (tourData && (tourData.pois.length > 0 || tourData.paths.length > 0)) {
      if (!confirm('This will clear the current tour. Are you sure you want to start a new tour?')) {
        return;
      }
    }
    
    // Clear current tour data
    setTourData(null);
    setBackgroundImage(null, null);
  };

  const handleFinishPath = () => {
    if (isDrawing) {
      completePath();
    }
  };

  const handleCancelPath = () => {
    if (isDrawing && confirm('Cancel current path?')) {
      cancelPath();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className={`flex items-center justify-between ${isMobile ? 'toolbar-mobile' : ''}`}>
        {/* Mobile menu button */}
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 hover:text-gray-800 md:hidden"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-center space-x-4">
          {/* Mode buttons */}
          <div className={`flex rounded-lg border border-gray-300 overflow-hidden ${isMobile ? 'mode-buttons' : ''}`}>
            <button
              onClick={() => handleModeChange('select')}
              className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium toolbar-button ${
                mode === 'select'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={isDrawing}
            >
              <MousePointer size={16} />
              <span>Select</span>
            </button>
            <button
              onClick={() => handleModeChange('poi')}
              className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border-l border-gray-300 ${
                mode === 'poi'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={isDrawing}
            >
              <MapPin size={16} />
              <span>POI</span>
            </button>
            <button
              onClick={() => handleModeChange('path')}
              className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border-l border-gray-300 ${
                mode === 'path'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Route size={16} />
              <span>Path</span>
            </button>
          </div>

          {/* Path drawing controls */}
          {isDrawing && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFinishPath}
                className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 flex items-center space-x-1"
              >
                <Save size={14} />
                <span>Finish</span>
              </button>
              <button
                onClick={handleCancelPath}
                className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 flex items-center space-x-1"
              >
                <Trash2 size={14} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Image upload */}
          <label className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 cursor-pointer flex items-center space-x-2">
            <Image size={16} />
            <span>Load Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* New Tour */}
          {tourData && (
            <button
              onClick={handleNewTour}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200 flex items-center space-x-2"
              title="Start a new tour"
            >
              <Trash2 size={16} />
              <span>New Tour</span>
            </button>
          )}

          {/* Import/Export */}
          <label className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 cursor-pointer flex items-center space-x-2">
            <Upload size={16} />
            <span>Import Tour</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {backgroundDimensions && (
            <button
              onClick={handleExport}
              disabled={!tourData}
              className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Tour info */}
      {tourData && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">{tourData.name}</span>
          <span className="mx-2">•</span>
          <span>{tourData.pois.length} POIs</span>
          <span className="mx-2">•</span>
          <span>{tourData.paths.length} Paths</span>
        </div>
      )}
    </div>
  );
};

export default Toolbar;