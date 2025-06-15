# @site-tour-tools/tour-component

A React TypeScript component for creating interactive guided tours with zoom, pan, and point-of-interest functionality.

## Features

- **Interactive Tour Canvas**: High-performance tour visualization with background images
- **Zoom & Pan**: Full zoom and pan capabilities using react-zoom-pan-pinch
- **Point of Interest (POI) Support**: Interactive markers with detailed information
- **Responsive Design**: Optimized layouts for both mobile and desktop
- **Unified Control Panel**: Combined tour controls and POI information
- **Smooth Animations**: Path progress and POI interactions with Framer Motion
- **State Management**: Powered by Zustand for efficient state handling

## Installation

```bash
npm install @site-tour-tools/tour-component
```

## Basic Usage

```tsx
import { TourComponent } from '@site-tour-tools/tour-component';
import { TourData } from '@site-tour-tools/shared';

const App = () => {
  const handleTourComplete = () => {
    console.log('Tour completed!');
  };

  const handlePOIVisit = (poi) => {
    console.log('Visited POI:', poi.label);
  };

  return (
    <TourComponent
      tourData={yourTourData}
      autoStart={false}
      showControls={true}
      showPOILabels={true}
      enableZoomPan={true}
      onTourComplete={handleTourComplete}
      onPOIVisit={handlePOIVisit}
      className="w-full h-screen"
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tourData` | `TourData` | **required** | Tour configuration and content |
| `className` | `string` | `''` | Additional CSS classes |
| `autoStart` | `boolean` | `false` | Start tour automatically on load |
| `showControls` | `boolean` | `true` | Show tour control panel |
| `showPOILabels` | `boolean` | `true` | Display POI labels on canvas |
| `showInfoPanel` | `boolean` | `true` | Show combined info panel |
| `enableZoomPan` | `boolean` | `true` | Enable zoom and pan functionality |
| `onTourComplete` | `() => void` | - | Callback when tour completes |
| `onPOIVisit` | `(poi: POI) => void` | - | Callback when POI is visited |

## Tour Data Structure

```typescript
interface TourData {
  id: string;
  name: string;
  description?: string;
  backgroundImage: {
    url: string;
    width: number;
    height: number;
  };
  pois: POI[];
  paths: Path[];
  settings: {
    autoStart: boolean;
    theme: {
      path: {
        color: string;
        activeColor: string;
        width: number;
      };
      poi: {
        color: string;
        size: number;
      };
      text: string;
      accent?: string;
    };
  };
}
```

## Responsive Behavior

### Mobile Layout
- **Full-screen canvas**: Image utilizes entire viewport
- **Bottom panel**: Tour controls and POI info slide up from bottom
- **Vertical collapse**: Panel collapses down with chevron controls
- **Touch-optimized**: Pinch-to-zoom and touch panning

### Desktop Layout
- **Split layout**: Canvas on left, control panel on right
- **Horizontal collapse**: Panel slides to the right when minimized
- **Mouse controls**: Wheel zoom, click-and-drag panning
- **Sidebar width**: Responsive panel sizing (max 384px)

## Control Panel Features

### Tour Controls
- **Play/Pause**: Control tour playback
- **Speed adjustment**: 0.5x to 2x playback speeds
- **Segment navigation**: Skip between tour segments
- **Progress indicators**: Overall and segment progress bars
- **Stop functionality**: Reset tour to beginning

### POI Information
- **Dynamic display**: Shows info when POI is selected or visited
- **Rich content**: Title, description, position, and metadata
- **Connected state**: Visual indicators for POI connectivity
- **No tab switching**: Both controls and POI info visible simultaneously

## Styling

The component uses Tailwind CSS classes and includes responsive design. You can override styles by:

1. **CSS Classes**: Pass custom `className` prop
2. **CSS Variables**: Override theme colors in your CSS
3. **Wrapper styling**: Style the parent container

```css
/* Custom styling example */
.tour-component {
  --tour-accent-color: #your-color;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Advanced Usage

### Custom Event Handling

```tsx
<TourComponent
  tourData={tourData}
  onPOIVisit={(poi) => {
    // Analytics tracking
    analytics.track('poi_visited', { poi_id: poi.id });
    
    // Custom UI updates
    showCustomNotification(poi.label);
  }}
  onTourComplete={() => {
    // Save completion state
    localStorage.setItem('tour_completed', 'true');
    
    // Redirect or show completion UI
    showCompletionModal();
  }}
/>
```

### Conditional Features

```tsx
const isMobile = window.innerWidth <= 768;

<TourComponent
  tourData={tourData}
  enableZoomPan={!isMobile} // Disable zoom on mobile
  showPOILabels={!isMobile} // Hide labels on small screens
  autoStart={isMobile} // Auto-start on mobile
/>
```

## Performance Notes

- **Image optimization**: Use appropriately sized background images
- **Path complexity**: Limit path points for smooth animations
- **POI count**: Consider performance with 50+ POIs
- **Memory management**: Component properly cleans up on unmount

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **Features**: Requires ES2020 support for optimal performance

## Recent Improvements

### v1.1.0 (Latest)
- ✅ **Fixed image scaling**: Images now use entire viewport correctly
- ✅ **Enhanced zoom/pan**: Improved touch and mouse interactions
- ✅ **Unified control panel**: No more tab switching between controls and POI info
- ✅ **Responsive collapse**: Proper directional collapse (right on desktop, down on mobile)
- ✅ **Removed redundant UI**: Eliminated duplicate titles and unnecessary elements
- ✅ **Better mobile experience**: Full-screen canvas with overlay controls
- ✅ **Aspect ratio preservation**: Images maintain correct proportions across devices

### Previous Issues Resolved
- ❌ Image auto-scaling smaller than viewport
- ❌ Tour progress popup obstructing image view
- ❌ UX compromised by tab system requiring user choice
- ❌ Incorrect collapse directions
- ❌ react-zoom-pan-pinch fit-content style conflicts

## Contributing

This package is part of the `@site-tour-tools` monorepo. See the main repository for contribution guidelines.

## License

MIT License - see LICENSE file for details.