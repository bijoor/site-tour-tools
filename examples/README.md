# Examples

This directory contains example implementations of the Site Tour Tools components.

## Basic Usage Example

The `basic-usage.tsx` file demonstrates how to:

1. **Import the TourComponent**: How to properly import and use the tour component
2. **Create Tour Data**: Example of a complete tour data structure
3. **Handle Events**: Implement tour completion and POI visit callbacks
4. **Configure Options**: Set up different display and interaction options

## Running the Examples

To use these examples in your own project:

1. **Install the packages**:
   ```bash
   npm install @site-tour-tools/tour-component @site-tour-tools/shared
   ```

2. **Import and use**:
   ```tsx
   import { TourComponent } from '@site-tour-tools/tour-component';
   import { TourData } from '@site-tour-tools/shared';
   ```

3. **Add the CSS**: Make sure to include Tailwind CSS or the component styles

## Creating Tour Data

### Using the Drawing Tool

The easiest way to create tour data is using the drawing tool:

1. Start the drawing tool: `npm run dev` in `packages/drawing-tool`
2. Load a background image (PNG, JPG, or SVG)
3. Place POIs by clicking in POI mode
4. Draw paths by clicking points in Path mode
5. Export the tour data as JSON

### Manual Creation

You can also create tour data manually:

```tsx
const tourData: TourData = {
  id: 'unique-tour-id',
  name: 'Tour Name',
  backgroundImage: {
    url: '/path/to/image.png',
    width: 1200,
    height: 800,
  },
  pois: [
    {
      id: 'poi-1',
      position: { x: 100, y: 200 },
      label: 'Point 1',
      description: 'Description of this point',
      isConnected: true,
    },
  ],
  paths: [
    {
      id: 'path-1',
      points: [
        { id: 'point-1', x: 100, y: 200, connectedPOI: 'poi-1' },
        { id: 'point-2', x: 300, y: 300 },
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
    theme: { /* theme configuration */ }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

## Component Props

### TourComponent Props

- `tourData`: The tour data object
- `className`: CSS classes for styling
- `autoStart`: Whether to start the tour automatically
- `showControls`: Show/hide the control panel
- `showPOILabels`: Show/hide POI labels
- `showPOIPanel`: Show/hide POI information panels
- `onTourComplete`: Callback when tour finishes
- `onPOIVisit`: Callback when a POI is visited

## Styling and Themes

The tour component uses Tailwind CSS classes and can be customized through:

1. **Theme object**: Configure colors, sizes, and styles
2. **CSS classes**: Override styles with custom CSS
3. **Component props**: Control visibility and behavior

Example theme customization:

```tsx
const customTheme = {
  primary: '#purple-500',
  poi: {
    color: '#green-500',
    size: 15,
    hoverColor: '#green-600',
  },
  path: {
    color: '#blue-500',
    width: 4,
    activeColor: '#blue-700',
  },
};
```