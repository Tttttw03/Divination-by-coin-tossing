import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HEXAGRAMS_DATA } from '../data/hexagrams';
import { LineType } from '../types';

const HexagramSymbol = ({ lines }: { lines: LineType[] }) => {
  // 转换爻象为显示顺序（从下往上）
  const displayLines = [...lines].reverse(); 

  return (
    <div className="flex flex-col gap-2 w-48 items-center">
      {displayLines.map((type, i) => (
        <motion.div 
          key={i}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className="h-4 flex justify-between gap-3 relative"
        >
          {/* 爻条主体 */}
          {(type === 7 || type === 9) ? (
            <div className="w-full h-full ink-line rounded-sm shadow-md"></div>
          ) : (
            <>
              <div className="w-[45%] h-full ink-line rounded-sm shadow-md"></div>
              <div className="w-[45%] h-full ink-line rounded-sm shadow-md"></div>
            </>
          )}

          {/* 老阴老阳标记 */}
          {type === 9 && (
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-traditional-red rounded-full flex items-center justify-center text-traditional-red font-bold text-xs scale-75">
              ○
            </div>
          )}
          {type === 6 && (
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-traditional-red font-bold text-lg scale-90">
              ×
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export const Result = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const binary = searchParams.get('b') || "111111"; // 默认乾卦
  const linesParam = searchParams.get('l');
  
  // 将 URL 中的 l 参数解析为 LineType[]，如果没有则根据 b 参数生成默认（少阴/少阳）
  const lines: LineType[] = linesParam 
    ? linesParam.split(',').map(Number) as LineType[]
    : binary.split('').map(b => (b === '1' ? 7 : 8)) as LineType[];
  
  const hexagram = HEXAGRAMS_DATA[binary] || {
    id: binary,
    name: "待解卦象",
    pinyin: "Dài Jiě Guà Xiàng",
    binary: binary,
    interpretation: {
      title: "卦辞诠释",
      content: [
        "此卦象之详细解读正在完善中...",
        "建议参考《易经》对应卦辞，或再次至诚祈愿，摇掷铜钱。",
        "易经之道，存乎一心，敬请期待完整数据库更新。"
      ]
    }
  };

  return (
    <div className="h-screen result-bg relative flex flex-col items-center py-6 px-8 overflow-hidden paper-inner-shadow">
      {/* 纸张纹理层 */}
      <div className="paper-texture"></div>

      {/* 动态水墨装饰 */}
      <div className="ink-smudge top-[-10%] right-[-5%] w-[60%] h-[60%] rotate-45 opacity-60"></div>
      <div className="ink-smudge bottom-[-15%] left-[-10%] w-[50%] h-[50%] -rotate-12 bg-traditional-red/5 opacity-40"></div>

      {/* Decorative Title Area (Compact) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center mb-6 relative z-10"
      >
        <div className="flex items-center gap-4 mb-1">
          <div className="w-12 h-px bg-ink/20"></div>
          <h1 className="text-5xl font-calligraphy text-ink tracking-[0.2em] drop-shadow-sm">周易 · 解卦</h1>
          <div className="w-12 h-px bg-ink/20"></div>
        </div>
        <p className="text-sm font-traditional text-ink/40 tracking-[0.5em] uppercase">Interpretation</p>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch relative z-10 flex-1 min-h-0 mb-6">
        {/* Left Section: Hexagram Symbol (Compact) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 flex flex-col items-center justify-center gap-8 chinese-card p-10 rounded-[2.5rem] relative group"
        >
          <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-traditional-red/10 group-hover:border-traditional-red/40 transition-all duration-700"></div>
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-traditional-red/10 group-hover:border-traditional-red/40 transition-all duration-700"></div>

          <div className="relative">
             <div className="absolute inset-0 blur-2xl bg-traditional-red/5 scale-125"></div>
             <HexagramSymbol lines={lines} />
          </div>
          
          <div className="flex flex-col items-center gap-4 relative z-10">
            <h2 className="text-6xl font-calligraphy text-traditional-red drop-shadow-md">
              {hexagram.name}
            </h2>
            <div className="px-4 py-1 rounded-full border border-traditional-red/20 bg-traditional-red/5">
              <p className="text-xl font-traditional text-traditional-red/70 italic tracking-widest">
                {hexagram.pinyin}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Content (Compact) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-3 flex flex-col gap-8 chinese-card p-10 lg:p-12 rounded-[2.5rem] relative min-h-0"
        >
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-traditional-red mb-1"></div>
              <div className="w-px h-12 bg-gradient-to-b from-traditional-red to-transparent"></div>
            </div>
            <div>
              <h3 className="text-3xl font-calligraphy text-ink mb-1">卦辞诠释</h3>
              <p className="text-sm font-traditional text-ink/30 tracking-widest uppercase italic">Detailed Interpretation</p>
            </div>
          </div>

          <div className="space-y-6 font-traditional text-ink overflow-y-auto pr-6 custom-scrollbar flex-1 min-h-0">
            {hexagram.interpretation.content.map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex gap-6 group/item"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-traditional-red/20 flex items-center justify-center text-traditional-red/40 font-bold text-lg group-hover/item:border-traditional-red group-hover/item:text-traditional-red transition-all duration-500 transform group-hover/item:rotate-12">
                  {i + 1}
                </div>
                <div className="flex flex-col gap-1">
                   <p className="text-xl leading-[1.6] text-justify font-medium text-ink/90 group-hover/item:text-ink transition-colors duration-300">
                    {text}
                  </p>
                  <div className="h-px w-0 group-hover/item:w-full bg-traditional-red/10 transition-all duration-700"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action: Restart (Compact) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="group relative flex items-center gap-4 px-12 py-4 bg-ink text-white rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-traditional-red/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="text-2xl font-calligraphy relative z-10 tracking-[0.2em]">再次占卜</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-white stroke-2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};
