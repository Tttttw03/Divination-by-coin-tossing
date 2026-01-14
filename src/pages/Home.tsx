import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { LineType } from '../types';

const Coin = ({ isTossing, result }: { isTossing: boolean, result: 'heads' | 'tails' }) => {
  return (
    <div className="perspective-1000">
      <motion.div
        className="w-24 h-24 relative [transform-style:preserve-3d]"
        animate={isTossing ? {
          rotateY: [0, 720, 1440, 2160],
          y: [0, -150, 0],
          scale: [1, 1.2, 1]
        } : {
          rotateY: result === 'heads' ? 0 : 180
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        {/* Front (Heads) - 使用用户上传的图片 */}
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden shadow-2xl backface-hidden bg-transparent flex items-center justify-center">
          <img 
            src="/coin-front.png" 
            alt="Heads" 
            className="w-full h-full object-cover scale-[1.08]"
            style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}
          />
          {/* 叠加一层淡淡的混合模式，让硬币与背景更融合 */}
          <div className="absolute inset-0 bg-ink/5 mix-blend-multiply pointer-events-none rounded-full"></div>
        </div>

        {/* Back (Tails) - 使用用户上传的图片 */}
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden shadow-2xl [transform:rotateY(180deg)] backface-hidden bg-transparent flex items-center justify-center">
          <img 
            src="/coin-back.png" 
            alt="Tails" 
            className="w-full h-full object-cover scale-[1.08]"
            style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))' }}
          />
          {/* 叠加一层淡淡的混合模式 */}
          <div className="absolute inset-0 bg-ink/5 mix-blend-multiply pointer-events-none rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
};

export const Home = () => {
  const [isTossing, setIsTossing] = useState(false);
  const [lines, setLines] = useState<LineType[]>([]);
  const [currentCoins, setCurrentCoins] = useState<('heads' | 'tails')[]>(['heads', 'heads', 'heads']);
  const navigate = useNavigate();

  const handleToss = () => {
    if (lines.length >= 6) return;
    
    setIsTossing(true);
    
    // 随机投掷三枚铜钱 (1/2 概率)
    const newCoins: ('heads' | 'tails')[] = Array(3).fill(null).map(() => 
      Math.random() > 0.5 ? 'heads' : 'tails'
    );
    
    setTimeout(() => {
      setCurrentCoins(newCoins);
      setIsTossing(false);
      
      // 根据用户修正的规则计算结果：
      // 三个正面 (3 heads) -> 6 (老阴 ×)
      // 三个反面 (0 heads) -> 9 (老阳 ○)
      // 一正二反 (1 head)  -> 8 (少阴 --)
      // 二正一反 (2 heads) -> 7 (少阳 —)
      const headsCount = newCoins.filter(c => c === 'heads').length;
      let newLine: LineType;
      
      if (headsCount === 3) newLine = 6;
      else if (headsCount === 0) newLine = 9;
      else if (headsCount === 1) newLine = 8;
      else newLine = 7;
      
      const updatedLines = [...lines, newLine];
      setLines(updatedLines);
      
      if (updatedLines.length === 6) {
        // 完成 6 爻，跳转到结果页
        // 传递完整爻象数据以便显示老阴老阳标记
        const linesParam = updatedLines.join(',');
        // 同时保留基础卦象 binary (1 为阳，0 为阴) 用于匹配数据库
        const binaryResult = updatedLines.map(line => (line === 7 || line === 9) ? '1' : '0').join('');
        
        setTimeout(() => {
          navigate(`/result?b=${binaryResult}&l=${linesParam}`);
        }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="h-screen parchment-bg relative flex flex-col items-center justify-between py-6 px-4 overflow-hidden paper-inner-shadow">
      {/* 纸张纹理层 */}
      <div className="paper-texture"></div>

      {/* 动态水墨装饰 - 模拟设计稿中的有机感 */}
      <div className="ink-smudge top-[-5%] left-[-5%] w-[50%] h-[50%] rotate-12"></div>
      <div className="ink-smudge bottom-[-10%] right-[-10%] w-[40%] h-[40%] -rotate-12 bg-traditional-red/5"></div>
      <div className="ink-smudge top-[20%] right-[10%] w-[15%] h-[15%] opacity-50"></div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        <h1 className="text-6xl font-calligraphy mb-2 text-ink drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] tracking-tight">周易占卜</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-8 bg-ink/20"></div>
          <p className="text-lg tracking-[0.8em] text-ink/70 font-traditional uppercase">古法灵签 · 运势指引</p>
          <div className="h-[1px] w-8 bg-ink/20"></div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center gap-4 relative z-10 w-full max-w-4xl flex-1 justify-center">
        
        {/* 1. 掷币区域 (Independent top area) */}
        <div className="w-full flex flex-col items-center gap-2 min-h-[160px] justify-center">
          <div className="flex gap-8 items-center justify-center">
            {currentCoins.map((coin, i) => (
              <Coin key={i} isTossing={isTossing} result={coin} />
            ))}
          </div>
          <p className="text-ink/40 text-xs font-traditional tracking-widest uppercase mt-2">
            {isTossing ? "正在感应天机..." : lines.length === 0 ? "至诚感通 · 摇掷铜钱" : `已成第 ${lines.length} 爻`}
          </p>
        </div>

        {/* 2. 步骤指引 (Compact) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xl grid grid-cols-3 gap-2 py-2 border-y border-ink/5"
        >
          <div className="flex items-center justify-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-traditional-red/20 flex items-center justify-center bg-white/30 backdrop-blur-sm group-hover:border-traditional-red/50 transition-all duration-500">
              <span className="text-traditional-red font-bold text-sm font-calligraphy">祈</span>
            </div>
            <p className="text-[10px] font-bold text-ink/60 font-traditional">1.诚心祈愿</p>
          </div>

          <div className="flex items-center justify-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-traditional-red/20 flex items-center justify-center bg-white/30 backdrop-blur-sm group-hover:border-traditional-red/50 transition-all duration-500">
              <span className="text-traditional-red font-bold text-sm font-calligraphy">掷</span>
            </div>
            <p className="text-[10px] font-bold text-ink/60 font-traditional">2.摇掷铜钱</p>
          </div>

          <div className="flex items-center justify-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-traditional-red/20 flex items-center justify-center bg-white/30 backdrop-blur-sm group-hover:border-traditional-red/50 transition-all duration-500">
              <span className="text-traditional-red font-bold text-sm font-calligraphy">解</span>
            </div>
            <p className="text-[10px] font-bold text-ink/60 font-traditional">3.解读卦辞</p>
          </div>
        </motion.div>

        {/* 3. 卷轴部分 (Shallower) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="scroll-container w-full max-w-xl aspect-[4/1]"
        >
          <div className="scroll-end"></div>
          <div className="scroll-body flex-1 flex flex-col items-center justify-center p-4">
            <div className="flex flex-col-reverse gap-1.5 w-full max-w-[160px]">
              {Array(6).fill(0).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={lines[i] !== undefined ? { opacity: 1, x: 0 } : { opacity: 0.1 }}
                  className="w-full h-4 relative flex items-center justify-center"
                >
                  {lines[i] !== undefined ? (
                    <>
                      {/* 爻条主体 */}
                      {(lines[i] === 7 || lines[i] === 9) ? (
                        <div className="w-full h-full ink-line rounded-sm shadow-sm scroll-hex-line"></div>
                      ) : (
                        <div className="flex justify-between w-full h-full">
                          <div className="w-[45%] h-full ink-line rounded-sm shadow-sm scroll-hex-line"></div>
                          <div className="w-[45%] h-full ink-line rounded-sm shadow-sm scroll-hex-line"></div>
                        </div>
                      )}
                      
                      {/* 老阴老阳标记 */}
                      {lines[i] === 9 && (
                        <div className="absolute -left-8 w-6 h-6 border-2 border-traditional-red rounded-full flex items-center justify-center text-traditional-red font-bold text-xs scale-75">
                          ○
                        </div>
                      )}
                      {lines[i] === 6 && (
                        <div className="absolute -left-8 w-6 h-6 flex items-center justify-center text-traditional-red font-bold text-lg scale-90">
                          ×
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-px border-t border-ink/10 border-dashed"></div>
                  )}
                  <span className="absolute -right-10 text-[9px] text-ink/40 font-traditional whitespace-nowrap">
                    {i === 0 ? "初爻" : i === 1 ? "二爻" : i === 2 ? "三爻" : i === 3 ? "四爻" : i === 4 ? "五爻" : "上爻"}
                  </span>
                </motion.div>
              ))}
            </div>
            {lines.length === 0 && !isTossing && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                className="absolute text-lg font-traditional tracking-widest text-ink pointer-events-none"
              >
                卦象记录于此...
              </motion.p>
            )}
          </div>
          <div className="scroll-end"></div>
        </motion.div>

        {/* 4. 摇掷按钮 (Compact) */}
        <div className="flex flex-col items-center mt-2">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#1a1a1a" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToss}
            disabled={isTossing || lines.length >= 6}
            className="px-16 py-4 bg-ink text-white rounded-full text-2xl font-calligraphy tracking-[0.3em] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-traditional-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {isTossing ? "摇卦中..." : lines.length >= 6 ? "卦成 · 正在解析" : "摇掷铜钱"}
          </motion.button>
          
          <div className="mt-4 flex items-center gap-4 opacity-10">
            <div className="w-8 h-px bg-ink"></div>
            <div className="w-1.5 h-1.5 rotate-45 border border-ink"></div>
            <div className="w-8 h-px bg-ink"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

