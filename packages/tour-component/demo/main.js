import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TourComponent } from '../dist/index.es.js';
import './src/style.css';

function TourDemo() {
    const [tourData, setTourData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoFollow, setAutoFollow] = useState(true);
    
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
    
    const loadExample = async (exampleName) => {
        setLoading(true);
        setError('');
        try {
            // Use path that works for both local dev and production
            const baseUrl = window.location.pathname.includes('/site-tour-tools/tour-player/') ? 
                '/site-tour-tools/tour-player' : '';
            const response = await fetch(`${baseUrl}/examples/${exampleName}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load example: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Loaded example tour:', data);
            setTourData(data);
        } catch (err) {
            setError(`Failed to load example: ${err.message}`);
            console.error('Error loading example:', err);
        } finally {
            setLoading(false);
        }
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
                }, 'Upload a tour JSON file exported from the drawing tool, try example tours, or use the basic sample.'),
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
                    
                    // Examples section
                    React.createElement('div', {
                        key: 'examples-section',
                        className: "border-t pt-4"
                    }, [
                        React.createElement('h3', {
                            key: 'examples-title',
                            className: "text-sm font-medium text-gray-700 mb-2"
                        }, 'Example Tours (Auto-Follow Demos):'),
                        React.createElement('div', {
                            key: 'examples-grid',
                            className: "grid grid-cols-1 gap-2"
                        }, [
                            React.createElement('button', {
                                key: 'warehouse-btn',
                                onClick: () => loadExample('warehouse-navigation'),
                                disabled: loading,
                                className: "px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                            }, loading ? 'Loading...' : 'Warehouse Navigation'),
                            React.createElement('button', {
                                key: 'apartments-btn', 
                                onClick: () => loadExample('apartments-tour'),
                                disabled: loading,
                                className: "px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                            }, loading ? 'Loading...' : 'Apartments Tour'),
                            React.createElement('button', {
                                key: 'zoo-btn',
                                onClick: () => loadExample('zoo-tour'),
                                disabled: loading,
                                className: "px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                            }, loading ? 'Loading...' : 'Zoo Tour')
                        ])
                    ]),
                    
                    React.createElement('button', {
                        key: 'sample-btn',
                        onClick: () => setTourData(sampleTourData),
                        className: "w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    }, 'Try Basic Sample Tour'),
                    error && React.createElement('div', { 
                        key: 'error',
                        className: "text-red-600 text-sm" 
                    }, error)
                ])
            ])
        );
    }
    
    return React.createElement('div', { className: "tour-container flex flex-col h-screen" }, [
        React.createElement('div', { 
            key: 'header',
            className: "bg-white border-b p-2 sm:p-3 flex items-center justify-between gap-2 flex-shrink-0",
            style: { minHeight: '48px', position: 'relative', zIndex: 10 }
        }, [
            React.createElement('h1', { 
                key: 'tour-title',
                className: "text-sm sm:text-lg font-bold truncate flex-1 min-w-0" 
            }, tourData.name),
            React.createElement('div', {
                key: 'controls-section',
                className: "flex items-center gap-1 sm:gap-3 flex-shrink-0"
            }, [
                React.createElement('label', {
                    key: 'auto-follow-label',
                    className: "flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"
                }, [
                    React.createElement('input', {
                        key: 'auto-follow-checkbox',
                        type: 'checkbox',
                        checked: autoFollow,
                        onChange: (e) => setAutoFollow(e.target.checked),
                        className: "rounded"
                    }),
                    React.createElement('span', {
                        key: 'auto-follow-text',
                        className: "text-gray-700"
                    }, 'Auto Zoom')
                ]),
                React.createElement('button', {
                    key: 'back-btn',
                    onClick: () => setTourData(null),
                    className: "px-2 py-1 sm:px-3 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs sm:text-sm whitespace-nowrap"
                }, 'Load')
            ])
        ]),
        React.createElement('div', { 
            key: 'tour-wrapper',
            className: "flex-1 relative min-h-0 overflow-hidden"
        }, 
            React.createElement(TourComponent, {
                tourData,
                className: "w-full h-full",
                autoStart: false,
                showControls: true,
                showPOILabels: true,
                showInfoPanel: true,
                enableZoomPan: true,
                autoFollow: autoFollow,
                onTourComplete: () => console.log('Tour completed!'),
                onPOIVisit: (poi) => console.log('Visited POI:', poi.label)
            })
        )
    ]);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(TourDemo));