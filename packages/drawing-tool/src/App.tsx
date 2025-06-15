import ErrorBoundary from './components/ErrorBoundary';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-100">
        <Toolbar />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <Canvas />
          </div>
          <Sidebar />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;