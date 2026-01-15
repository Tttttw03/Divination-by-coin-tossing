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
  
  const hexagramData = HEXAGRAMS_DATA[binary];
  
  if (!hexagramData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl font-traditional text-ink/60">卦象解析中...</p>
      </div>
    );
  }

  const hexagram = hexagramData;

  const [activeTab, setActiveTab] = React.useState<'gua' | 'yao' | 'expert'>('gua');

  // 解析名家解卦内容
  const expertSections = React.useMemo(() => {
    if (!hexagram.shaoYong) return [];
    
    const content = hexagram.shaoYong;
    const sections: { title: string; content: string }[] = [];
    
    // 定义关键字及其对应的小标题
    const markers = [
      { key: '台湾国学大儒傅佩荣解', title: '台湾国学大儒傅佩荣解' },
      { key: '传统解卦', title: '传统解卦' },
      { key: '台湾张铭仁解卦', title: '台湾张铭仁解卦' }
    ];
    
    let lastIndex = 0;
    let currentTitle = '北宋易学家邵雍解';
    
    markers.forEach((marker) => {
      const index = content.indexOf(marker.key);
      if (index !== -1) {
        const sectionContent = content.substring(lastIndex, index).trim();
        if (sectionContent) {
          sections.push({ title: currentTitle, content: sectionContent });
        }
        currentTitle = marker.title;
        lastIndex = index + marker.key.length;
      }
    });
    
    // 添加最后一个部分
    const remainingContent = content.substring(lastIndex).trim();
    if (remainingContent) {
      sections.push({ title: currentTitle, content: remainingContent });
    }
    
    return sections;
  }, [hexagram.shaoYong]);

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

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10 flex-1 min-h-0 mb-6">
        {/* Left Section: Hexagram Symbol (Compact) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-4 flex flex-col items-center justify-center gap-8 chinese-card p-10 rounded-[2.5rem] relative group"
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
          className="lg:col-span-8 flex flex-col chinese-card p-8 lg:p-10 rounded-[2.5rem] relative min-h-0 overflow-hidden"
        >
          {/* Tabs Navigation */}
          <div className="flex gap-4 mb-8 border-b border-ink/5 pb-2">
            {[
              { id: 'gua', label: '卦辞详解', icon: '卦' },
              { id: 'yao', label: '爻辞解读', icon: '爻' },
              { id: 'expert', label: '名家解卦', icon: '名' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-2 transition-all duration-300 group ${activeTab === tab.id ? 'text-traditional-red' : 'text-ink/40 hover:text-ink/60'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${activeTab === tab.id ? 'border-traditional-red bg-traditional-red/5' : 'border-ink/20 group-hover:border-ink/40'}`}>
                    {tab.icon}
                  </span>
                  <span className="text-xl font-calligraphy tracking-wider">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-traditional-red"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {activeTab === 'gua' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 font-traditional"
              >
                <div className="bg-traditional-red/5 p-6 rounded-2xl border border-traditional-red/10">
                  <h4 className="text-traditional-red text-sm mb-4 tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-traditional-red"></span>
                    卦辞原文
                  </h4>
                  <p className="text-2xl leading-relaxed text-ink font-medium">{hexagram.originalText}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-traditional-red text-sm tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-traditional-red"></span>
                    象曰
                  </h4>
                  <p className="text-xl leading-relaxed text-ink/80 italic">{hexagram.xiangCi}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-ink/5">
                  <h4 className="text-traditional-red text-sm tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-traditional-red"></span>
                    白话解析
                  </h4>
                  <p className="text-lg leading-loose text-ink/70 text-justify">{hexagram.explanation}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'yao' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 font-traditional"
              >
                {hexagram.yaoCi.map((yao, idx) => {
                  const isMoving = lines[idx] === 6 || lines[idx] === 9;
                  return (
                    <div 
                      key={idx} 
                      className={`p-6 rounded-2xl border transition-all duration-500 ${isMoving ? 'bg-traditional-red/5 border-traditional-red/20 shadow-sm' : 'border-ink/5 hover:border-ink/10'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isMoving ? 'bg-traditional-red text-white' : 'bg-ink/5 text-ink/40'}`}>
                            {idx + 1}
                          </span>
                          <h5 className={`text-xl font-medium ${isMoving ? 'text-traditional-red' : 'text-ink/80'}`}>{yao.ci}</h5>
                        </div>
                        {isMoving && (
                          <span className="px-3 py-1 bg-traditional-red/10 text-traditional-red text-xs rounded-full border border-traditional-red/20 animate-pulse">
                            动爻 (关键解读)
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 pl-11">
                        <p className="text-lg text-ink/70 leading-relaxed">{yao.explanation}</p>
                        {yao.shaoYong && (
                          <div className="pt-2 mt-2 border-t border-ink/5">
                            <p className="text-sm text-traditional-red/60 font-medium">断语：{yao.shaoYong}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }).reverse()} {/* 逆序显示，从上爻到底爻？通常易经从初爻（下）到上爻（上）。UI上从上到下显示比较符合阅读习惯，这里我们显示初爻在最上面还是最下面？代码里 idx 0 是初爻。为了阅读习惯，我们保持 idx 0 在最上面，或者标注清楚。这里 reverse() 之后 idx 5 (上爻) 在最上面。 */}
              </motion.div>
            )}

            {activeTab === 'expert' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 font-traditional"
              >
                <div className="chinese-card-inner p-8 bg-ink/[0.02] border border-ink/5 rounded-3xl">
                  <h4 className="text-3xl font-calligraphy text-ink mb-8 border-b border-ink/10 pb-4">名家解卦</h4>
                  <div className="space-y-10">
                    {expertSections.map((section, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1.5 h-6 bg-traditional-red rounded-full"></div>
                          <h5 className="text-2xl font-calligraphy text-traditional-red">{section.title}</h5>
                        </div>
                        <div className="text-lg leading-loose text-ink/80 whitespace-pre-line text-justify pl-4 border-l border-ink/5 ml-0.5">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
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
