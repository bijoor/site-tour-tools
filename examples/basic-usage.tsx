import React from 'react';
import { TourComponent } from '@site-tour-tools/tour-component';
import { TourData } from '@site-tour-tools/shared';

// Example tour data
const sampleTourData: TourData = {
  id: 'sample-tour',
  name: 'Sample Building Tour',
  description: 'A basic tour of our office building',
  backgroundImage: {
    url: '/path/to/your/building-floorplan.png',
    width: 1200,
    height: 800,
  },
  pois: [
    {
      id: 'poi-1',
      position: { x: 200, y: 150 },
      label: 'Reception',
      description: 'Main reception area where visitors check in',
      isConnected: true,
    },
    {
      id: 'poi-2',
      position: { x: 600, y: 300 },
      label: 'Conference Room A',
      description: 'Large conference room for team meetings',
      isConnected: true,
    },
    {
      id: 'poi-3',
      position: { x: 400, y: 500 },
      label: 'Kitchen',
      description: 'Employee kitchen and break area',
      isConnected: true,
    },
  ],
  paths: [
    {
      id: 'path-1',
      points: [
        { id: 'point-1', x: 200, y: 150, connectedPOI: 'poi-1' },
        { id: 'point-2', x: 300, y: 200 },
        { id: 'point-3', x: 500, y: 280 },
        { id: 'point-4', x: 600, y: 300, connectedPOI: 'poi-2' },
      ],
      color: '#3b82f6',
      width: 3,
      style: 'solid',
    },
    {
      id: 'path-2',
      points: [
        { id: 'point-5', x: 600, y: 300, connectedPOI: 'poi-2' },
        { id: 'point-6', x: 550, y: 400 },
        { id: 'point-7', x: 450, y: 480 },
        { id: 'point-8', x: 400, y: 500, connectedPOI: 'poi-3' },
      ],
      color: '#3b82f6',
      width: 3,
      style: 'solid',
    },
  ],
  settings: {
    animationSpeed: 1,
    pauseAtPOI: 2000,
    showPOILabels: true,
    autoStart: false,
    loop: false,
    theme: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
      text: '#1f2937',
      accent: '#f59e0b',
      poi: {
        color: '#ef4444',
        size: 12,
        hoverColor: '#dc2626',
      },
      path: {
        color: '#3b82f6',
        width: 3,
        activeColor: '#1d4ed8',
      },
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const BasicTourExample: React.FC = () => {
  const handleTourComplete = () => {
    console.log('Tour completed!');
    alert('Tour completed! Thank you for taking our virtual tour.');
  };

  const handlePOIVisit = (poi: any) => {
    console.log('Visited POI:', poi.label);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Site Tour Component Example
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <TourComponent
            tourData={sampleTourData}
            className="h-96"
            autoStart={false}
            showControls={true}
            showPOILabels={true}
            showPOIPanel={true}
            onTourComplete={handleTourComplete}
            onPOIVisit={handlePOIVisit}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium">Controls:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Click the play button to start the tour</li>
                <li>Use the progress bar to seek to different parts</li>
                <li>Adjust speed with the speed selector</li>
                <li>Click POIs to view detailed information</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Features:</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Smooth animation along predefined paths</li>
                <li>Interactive POI information panels</li>
                <li>Mobile-responsive touch controls</li>
                <li>Customizable themes and styling</li>
                <li>Progress tracking and completion events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicTourExample;