# Site Tour Tools

An interactive toolkit for creating and displaying guided tours of images, maps, or any visual content. Perfect for creating step-by-step walkthroughs, educational content, or interactive presentations.

## 🎯 Features

### Drawing Tool
- **POI Placement**: Click to place Points of Interest with custom labels
- **Path Drawing**: Draw paths between POIs with automatic snapping
- **Interactive Canvas**: Zoom, pan, and navigate large images smoothly  
- **Import/Export**: Save and load tour data as JSON files
- **Mobile Responsive**: Works on desktop and mobile devices

### Tour Component
- **Animated Playback**: Smooth animation following the drawn paths
- **Segment-Based Tours**: Automatic pausing between path segments
- **Interactive Controls**: Play/pause, speed control, segment navigation
- **POI Information**: Click POIs for detailed information panels
- **Progress Tracking**: Visual progress indicators and visited POI tracking

## 🚀 Live Demo

- **Drawing Tool**: [Create Tours](https://ashutoshbijoor.github.io/site-tour-tools/)
- **Tour Player**: [View Tours](https://ashutoshbijoor.github.io/site-tour-tools/tour-player/)

## 📦 Project Structure

This is a TypeScript monorepo with three main packages:

```
├── packages/
│   ├── shared/           # Common utilities and types
│   ├── drawing-tool/     # Tour creation interface  
│   └── tour-component/   # Tour playback component
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm 8+

### Setup
```bash
# Clone the repository
git clone https://github.com/ashutoshbijoor/site-tour-tools.git
cd site-tour-tools

# Install dependencies for all packages
npm install

# Build shared package
cd packages/shared && npm run build

# Start drawing tool development server
cd ../drawing-tool && npm run dev
# Opens at http://localhost:5174

# Start tour component demo (in separate terminal)
cd ../tour-component/demo && npm run dev  
# Opens at http://localhost:5175
```

### Building for Production
```bash
# Build all packages
npm run build

# Build individual packages
cd packages/drawing-tool && npm run build
cd packages/tour-component && npm run build
```

## 📖 Usage

### Creating a Tour

1. **Load an Image**: Click "Load Image" and select your background image
2. **Place POIs**: Switch to POI mode and click to place points of interest
3. **Draw Paths**: Switch to Path mode and draw connections between POIs
4. **Export Tour**: Click "Export" to download your tour as a JSON file

### Playing a Tour

1. **Import Tour**: Upload a tour JSON file or try the sample tour
2. **Playback Controls**: Use play/pause and speed controls
3. **Navigation**: Use Previous/Next buttons to navigate between segments
4. **Interaction**: Click POIs for information panels

## 🎮 Controls

### Drawing Tool
- **Select Mode**: Pan and zoom the canvas, select existing elements
- **POI Mode**: Click to place Points of Interest
- **Path Mode**: Click to draw paths, double-click to finish
- **Mouse/Touch**: Zoom with scroll wheel, pan by dragging

### Tour Player  
- **Play/Pause**: Start/stop tour animation
- **Speed Control**: Adjust playback speed (0.25x - 3x)
- **Segment Navigation**: Skip between path segments
- **POI Interaction**: Click POIs for detailed information

## 🔧 Technical Details

### Architecture
- **Monorepo**: npm workspaces for package management
- **TypeScript**: Full type safety across all packages
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast development and optimized production builds
- **Zustand**: Lightweight state management
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling

### Key Libraries
- `react-zoom-pan-pinch`: Canvas zoom and pan functionality
- `lucide-react`: Modern icon library
- `zustand`: State management
- `framer-motion`: Animation library

### Browser Support
- Chrome 88+
- Firefox 85+  
- Safari 14+
- Edge 88+

## 🤝 Contributing

This is an alpha version. Feedback and contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

- [ ] **Enhanced POI Management**: Rich text descriptions, images, videos
- [ ] **Advanced Path Features**: Curved paths, multiple route options
- [ ] **Tour Templates**: Pre-built templates for common use cases
- [ ] **Collaboration**: Multi-user editing and sharing
- [ ] **Analytics**: View tracking and engagement metrics
- [ ] **Integrations**: Embed tours in websites and applications

## 🔗 Links

- [Live Demo](https://ashutoshbijoor.github.io/site-tour-tools/)
- [Issues](https://github.com/ashutoshbijoor/site-tour-tools/issues)
- [Discussions](https://github.com/ashutoshbijoor/site-tour-tools/discussions)

---

Built with ❤️ using React, TypeScript, and modern web technologies.