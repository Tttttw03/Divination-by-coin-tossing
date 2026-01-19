import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Result } from './pages/Result';

function App() {
  return (
    <>
      {/* Global SVG Filters for Ink Effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="ink-bleed">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
