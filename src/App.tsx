import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { Result } from './pages/Result';

// 导入资源以获取构建后的路径
import coinFront from './assets/coin-front.png';
import coinBack from './assets/coin-back.png';
import logo from './assets/logo.svg';
import bgMountains from './bg-mountains.png';

const LoadingScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-[#f4eccd] flex flex-col items-center justify-center"
  >
    <div className="relative w-24 h-24 mb-8">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-t-2 border-traditional-red rounded-full"
      />
      <img src={logo} alt="Loading" className="absolute inset-4 w-16 h-16 object-contain mix-blend-multiply opacity-50" />
    </div>
    <p className="text-xl font-calligraphy text-ink/60 tracking-widest animate-pulse">正在开启天机...</p>
  </motion.div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 关键资源：影响第一眼视觉的资源
    const criticalAssets = [logo, bgMountains];
    // 次要资源：可以在后台加载，不阻塞首屏显示
    const secondaryAssets = [coinFront, coinBack];
    
    let loadedCount = 0;
    let isTimedOut = false;

    // 设置最大等待时间为 5 秒，防止加载过慢导致用户流失
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        isTimedOut = true;
        setIsLoading(false);
        console.log("Loading timed out, showing app anyway.");
      }
    }, 5000);

    const handleAssetLoad = () => {
      if (isTimedOut) return;
      loadedCount++;
      if (loadedCount === criticalAssets.length) {
        clearTimeout(timeoutId);
        // 稍微延迟一下，确保渲染平滑
        setTimeout(() => setIsLoading(false), 600);
      }
    };

    // 优先加载关键资源
    criticalAssets.forEach(asset => {
      const img = new Image();
      img.src = asset;
      img.onload = handleAssetLoad;
      img.onerror = handleAssetLoad;
    });

    // 后台加载次要资源（大图）
    secondaryAssets.forEach(asset => {
      const img = new Image();
      img.src = asset;
    });

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

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
