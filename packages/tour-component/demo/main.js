import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TourComponent } from '../dist/index.es.js';
import './src/style.css';

function TourDemo() {
    const [tourData, setTourData] = useState(null);
    const [error, setError] = useState('');
    
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                console.log('Loaded tour data:', data);
                setTourData(data);
                setError('');
            } catch (err) {
                setError('Invalid JSON file: ' + err.message);
                console.error('Error loading tour:', err);
            }
        };
        reader.readAsText(file);
    };
    
    const sampleTourData = {
        id: 'sample-tour',
        name: 'Sample Tour',
        description: 'A demonstration tour',
        backgroundImage: {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNHB4IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2FtcGxlIEJhY2tncm91bmQgSW1hZ2U8L3RleHQ+PC9zdmc+',
            width: 800,
            height: 600
        },
        pois: [
            {
                id: 'poi-1',
                position: { x: 200, y: 150 },
                label: 'Point 1',
                isConnected: true
            },
            {
                id: 'poi-2', 
                position: { x: 600, y: 300 },
                label: 'Point 2',
                isConnected: true
            }
        ],
        paths: [
            {
                id: 'path-1',
                points: [
                    { id: 'p1', x: 200, y: 150, timestamp: 0 },
                    { id: 'p2', x: 400, y: 225, timestamp: 1000 },
                    { id: 'p3', x: 600, y: 300, timestamp: 2000 }
                ],
                color: '#3b82f6',
                width: 3,
                style: 'solid'
            },
            {
                id: 'path-2',
                points: [
                    { id: 'p4', x: 600, y: 300, timestamp: 0 },
                    { id: 'p5', x: 400, y: 450, timestamp: 1000 },
                    { id: 'p6', x: 100, y: 500, timestamp: 2000 }
                ],
                color: '#ef4444',
                width: 3,
                style: 'solid'
            }
        ],
        settings: {
            autoStart: false,
            speed: 1,
            theme: {
                poi: {
                    color: '#ef4444',
                    selectedColor: '#dc2626',
                    size: 8
                },
                path: {
                    color: '#3b82f6',
                    width: 3
                }
            }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (!tourData) {
        return React.createElement('div', { 
            className: "flex items-center justify-center h-screen bg-gray-100" 
        }, 
            React.createElement('div', { 
                className: "bg-white p-8 rounded-lg shadow-lg max-w-md w-full" 
            }, [
                React.createElement('h1', { 
                    key: 'title',
                    className: "text-2xl font-bold mb-4 text-center" 
                }, 'Tour Component Demo'),
                React.createElement('p', { 
                    key: 'desc',
                    className: "text-gray-600 mb-4" 
                }, 'Upload a tour JSON file exported from the drawing tool, or try the sample tour.'),
                React.createElement('div', { 
                    key: 'controls',
                    className: "space-y-4" 
                }, [
                    React.createElement('label', { 
                        key: 'file-label',
                        className: "block" 
                    }, [
                        React.createElement('span', { 
                            key: 'file-text',
                            className: "text-sm font-medium text-gray-700" 
                        }, 'Select Tour File:'),
                        React.createElement('input', {
                            key: 'file-input',
                            type: 'file',
                            accept: '.json',
                            onChange: handleFileUpload,
                            className: "mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        })
                    ]),
                    React.createElement('button', {
                        key: 'sample-btn',
                        onClick: () => setTourData(sampleTourData),
                        className: "w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    }, 'Try Sample Tour'),
                    error && React.createElement('div', { 
                        key: 'error',
                        className: "text-red-600 text-sm" 
                    }, error)
                ])
            ])
        );
    }
    
    return React.createElement('div', { className: "tour-container" }, [
        React.createElement('div', { 
            key: 'header',
            className: "bg-white border-b p-4 flex justify-between items-center" 
        }, [
            React.createElement('h1', { 
                key: 'tour-title',
                className: "text-xl font-bold" 
            }, `Tour: ${tourData.name}`),
            React.createElement('button', {
                key: 'back-btn',
                onClick: () => setTourData(null),
                className: "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            }, 'Load Different Tour')
        ]),
        React.createElement('div', { 
            key: 'tour-wrapper',
            className: "h-full relative",
            style: { height: 'calc(100vh - 73px)' }
        }, 
            React.createElement(TourComponent, {
                tourData,
                className: "w-full h-full",
                autoStart: false,
                showControls: true,
                showPOILabels: true,
                showInfoPanel: true,
                enableZoomPan: true,
                autoFollow: true,
                onTourComplete: () => console.log('Tour completed!'),
                onPOIVisit: (poi) => console.log('Visited POI:', poi.label)
            })
        )
    ]);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(TourDemo));