import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HEXAGRAMS_DATA } from '../data/hexagrams';
import { LineType } from '../types';

const HexagramSymbol = ({ lines, isChange = false }: { lines: LineType[], isChange?: boolean }) => {
  // 转换爻象为显示顺序（从下往上）
  const displayLines = [...lines].reverse(); 

  return (
    <div className="flex flex-col gap-2 w-48 items-center">
      {displayLines.map((originalType, i) => {
        // 如果是变卦，阴阳需要翻转
        let displayType = originalType;
        if (isChange) {
          if (originalType === 6) displayType = 7; // 老阴变少阳
          else if (originalType === 9) displayType = 8; // 老阳变少阴
        }

        return (
          <motion.div 
            key={i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="h-4 flex justify-between gap-3 relative"
          >
            {/* 爻条主体 */}
            {(displayType === 7 || displayType === 9) ? (
              <div className="w-full h-full ink-line rounded-sm shadow-md"></div>
            ) : (
              <>
                <div className="w-[45%] h-full ink-line rounded-sm shadow-md"></div>
                <div className="w-[45%] h-full ink-line rounded-sm shadow-md"></div>
              </>
            )}

            {/* 老阴老阳标记 - 始终基于原始爻性显示 */}
            {originalType === 9 && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-traditional-red rounded-full flex items-center justify-center text-traditional-red font-bold text-xs scale-75">
                ○
              </div>
            )}
            {originalType === 6 && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-traditional-red font-bold text-lg scale-90">
                ×
              </div>
            )}
          </motion.div>
        );
      })}
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
  const [activeGua, setActiveGua] = React.useState<'original' | 'change'>('original');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 切换页签或卦象时，重置滚动位置
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, activeGua]);

  // 当动爻数量较多时，自动切换到变卦视角（可选，此处保持默认本卦，由用户手动切换）
  // 或者根据 guide 策略自动提示切换
  
  // 计算动爻和变卦
  const movingIndices = React.useMemo(() => 
    lines.reduce((acc, type, idx) => {
      if (type === 6 || type === 9) acc.push(idx);
      return acc;
    }, [] as number[]),
  [lines]);
  
  const movingCount = movingIndices.length;

  const changeBinary = React.useMemo(() => 
    lines.map((type) => {
      // 6 (老阴) -> 变阳 (1)
      // 9 (老阳) -> 变阴 (0)
      // 7 (少阳) -> 保持阳 (1)
      // 8 (少阴) -> 保持阴 (0)
      if (type === 6) return '1';
      if (type === 9) return '0';
      if (type === 7) return '1';
      return '0';
    }).join(''),
  [lines]);

  const changeHexagram = HEXAGRAMS_DATA[changeBinary];

  // 断卦指引逻辑
  const guide = React.useMemo(() => {
    switch (movingCount) {
      case 0:
        return {
          case: "无动爻（静卦）",
          strategy: "直接看本卦的卦辞。",
          supplement: null
        };
      case 1:
        return {
          case: "一个动爻",
          strategy: "主要看本卦中该动爻的爻辞。",
          supplement: null
        };
      case 2:
        return {
          case: "两个动爻",
          strategy: "看本卦中这两个动爻的爻辞。",
          supplement: "以上爻（位置高）为主，下爻为辅。"
        };
      case 3:
        return {
          case: "三个动爻",
          strategy: "看本卦卦辞与变卦卦辞。",
          supplement: "以本卦卦辞（起始状态）为主，（七成）；变卦卦辞（最终结果）为辅（三成）。"
        };
      case 4:
        return {
          case: "四个动爻",
          strategy: "看变卦中剩下的两个不变爻（静爻）的爻辞。",
          supplement: "以下爻（位置低）为主，上爻为辅。"
        };
      case 5:
        return {
          case: "五个动爻",
          strategy: "看变卦中唯一不变爻(静爻)的爻辞。",
          supplement: null
        };
      case 6:
        if (binary === "111111") {
          return {
            case: "六个爻全变（乾卦）",
            strategy: "看“用九”。",
            supplement: null
          };
        } else if (binary === "000000") {
          return {
            case: "六个爻全变（坤卦）",
            strategy: "看“用六”。",
            supplement: null
          };
        } else {
          return {
            case: "六个爻全变",
            strategy: `直接看变卦《${changeHexagram?.name || ''}》的卦辞。`,
            supplement: null
          };
        }
      default:
        return null;
    }
  }, [movingCount, changeHexagram, binary]);

  // 解析名家解卦内容
  const expertSections = React.useMemo(() => {
    const targetHex = activeGua === 'original' ? hexagram : changeHexagram;
    if (!targetHex || !targetHex.shaoYong) return [];
    
    const content = targetHex.shaoYong;
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
  }, [activeGua, hexagram, changeHexagram]);

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
          <h1 className="text-5xl font-calligraphy text-ink tracking-[0.1em] drop-shadow-sm flex items-center gap-3">
            <span>周易</span>
            <img 
              src="logo.svg" 
              alt="Logo" 
              className="w-12 h-12 object-contain mix-blend-multiply opacity-80"
            />
            <span>解卦</span>
          </h1>
          <div className="w-12 h-px bg-ink/20"></div>
        </div>
        <p className="text-sm font-traditional text-ink/40 tracking-[0.5em] uppercase">Interpretation</p>
      </motion.div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1 min-h-0 mb-6">
        {/* Left Section: Hexagram Symbol & Interpretation Guide */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-4 flex flex-col gap-5 pb-10 lg:pb-0"
        >
          {/* Main Card: Symbol & Name */}
          <div className="chinese-card p-5 rounded-[2rem] relative group flex flex-col items-center justify-center gap-3">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-traditional-red/10 group-hover:border-traditional-red/40 transition-all duration-700"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-traditional-red/10 group-hover:border-traditional-red/40 transition-all duration-700"></div>

            <div className="relative scale-75 -my-4">
               <div className="absolute inset-0 blur-2xl bg-traditional-red/5 scale-125"></div>
               <HexagramSymbol 
                lines={lines} 
                isChange={activeGua === 'change'} 
              />
            </div>
            
            <div className="flex flex-col items-center gap-1 relative z-10">
              <h2 className="text-4xl font-calligraphy text-traditional-red drop-shadow-sm">
                {activeGua === 'original' ? hexagram.name : changeHexagram?.name}
              </h2>
              <div className="px-2 py-0.5 rounded-full border border-traditional-red/20 bg-traditional-red/5">
                <p className="text-base font-traditional text-traditional-red/70 italic tracking-widest">
                  {activeGua === 'original' ? hexagram.pinyin : changeHexagram?.pinyin}
                </p>
              </div>
            </div>
          </div>

          {/* Interpretation Guide Card */}
          {guide && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="chinese-card p-4 rounded-[1.5rem] border-traditional-red/10 bg-traditional-red/[0.01] flex flex-col gap-2 shadow-inner"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-traditional-red/10 flex items-center justify-center text-traditional-red">
                   <span className="font-calligraphy text-base">断</span>
                </div>
                <h4 className="text-lg font-calligraphy text-ink">断卦指引</h4>
                <span className="ml-auto px-2 py-0.5 bg-traditional-red text-white text-[9px] rounded-full font-traditional">{guide.case}</span>
              </div>

              <div className="space-y-2 font-traditional">
                <div className="bg-white/40 p-2 rounded-xl border border-ink/5">
                  <p className="text-[8px] text-traditional-red/50 tracking-[0.2em] uppercase mb-0.5 font-bold">断卦方式</p>
                  <p className="text-xs text-ink/90 leading-relaxed font-medium">{guide.strategy}</p>
                </div>
                {guide.supplement && (
                  <div className="px-1">
                    <p className="text-xs text-ink/60 leading-relaxed italic">{guide.supplement}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Annotations Section */}
          <div className="px-2 py-0.5 space-y-3">
             <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/10 to-transparent"></div>
                <p className="text-[8px] font-traditional text-ink/30 tracking-[0.2em] uppercase whitespace-nowrap">爻位动向参考</p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/10 to-transparent"></div>
             </div>
             
             <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-traditional-red/70 font-traditional">初二爻: 起步阶段</p>
                   <p className="text-[9px] text-ink/50 leading-tight font-traditional">事情萌芽，处于基层。</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-traditional-red/70 font-traditional">三四爻: 转折半途</p>
                   <p className="text-[9px] text-ink/50 leading-tight font-traditional">人事纠葛，进退两难。</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-traditional-red/70 font-traditional">五爻: 核心决策</p>
                   <p className="text-[9px] text-ink/50 leading-tight font-traditional">关键时刻，成败所在。</p>
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-bold text-traditional-red/70 font-traditional">上爻: 尾声终局</p>
                   <p className="text-[9px] text-ink/50 leading-tight font-traditional">代表结束与最终结果。</p>
                </div>
             </div>

             <div className="pt-2 border-t border-ink/5">
                <p className="text-[9px] text-ink/40 leading-relaxed font-traditional text-justify italic">
                  卦辞观大势，爻辞断节点。爻凶卦吉意为大局好但做法险；爻吉卦凶则是眼下有戏但大势不利。
                </p>
             </div>
          </div>
        </motion.div>

        {/* Right Section: Content (Compact) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-8 flex flex-col chinese-card p-6 lg:p-8 rounded-[2rem] relative min-h-0 overflow-hidden h-full"
        >
          {/* Tabs & Hexagram Switcher Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-ink/5 pb-4">
            <div className="flex gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap">
              {[
                { id: 'gua', label: '卦辞详解', icon: '卦' },
                { id: 'yao', label: '爻辞解读', icon: '爻' },
                { id: 'expert', label: '名家解卦', icon: '名' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-1.5 transition-all duration-300 group ${activeTab === tab.id ? 'text-traditional-red' : 'text-ink/40 hover:text-ink/60'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${activeTab === tab.id ? 'border-traditional-red bg-traditional-red/5' : 'border-ink/20 group-hover:border-ink/40'}`}>
                      {tab.icon}
                    </span>
                    <span className="text-lg font-calligraphy tracking-wider">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-traditional-red shadow-[0_2px_10px_rgba(183,35,38,0.3)]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Hexagram Switcher (Only show if there are moving lines) */}
            {movingCount > 0 && (
              <div className="flex p-1 bg-ink/5 rounded-full border border-ink/5 self-start sm:self-center">
                <button
                  onClick={() => setActiveGua('original')}
                  className={`px-4 py-1 rounded-full text-xs font-traditional transition-all duration-300 ${activeGua === 'original' ? 'bg-white text-traditional-red shadow-sm' : 'text-ink/40 hover:text-ink/60'}`}
                >
                  本卦
                </button>
                <button
                  onClick={() => setActiveGua('change')}
                  className={`px-4 py-1 rounded-full text-xs font-traditional transition-all duration-300 ${activeGua === 'change' ? 'bg-white text-traditional-red shadow-sm' : 'text-ink/40 hover:text-ink/60'}`}
                >
                  变卦
                </button>
              </div>
            )}
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
          >
            {/* Current Hexagram Info Badge (Shows when viewing Change Hexagram) */}
            {movingCount > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-traditional text-ink/40">当前查看：</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-traditional ${activeGua === 'original' ? 'bg-traditional-red/5 text-traditional-red' : 'bg-ink/5 text-ink/60'}`}>
                  {activeGua === 'original' ? `本卦 · ${hexagram.name}` : `变卦 · ${changeHexagram?.name}`}
                </span>
                {activeGua === 'change' && (
                  <span className="text-[10px] font-traditional text-traditional-red/60 bg-traditional-red/5 px-2 py-0.5 rounded-full animate-pulse">
                    正在查看事情的发展趋势
                  </span>
                )}
              </div>
            )}

            {activeTab === 'gua' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="font-traditional">
                  <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-traditional-red rounded-full"></div>
                    卦辞
                  </h3>
                  <div className="p-5 bg-ink/[0.02] rounded-2xl border border-ink/5 relative group">
                    <p className="text-xl leading-relaxed text-ink/90 font-medium mb-4 relative z-10">
                      {(activeGua === 'original' ? hexagram : changeHexagram)?.originalText}
                    </p>
                    <p className="text-base leading-relaxed text-ink/60 italic relative z-10">
                      {(activeGua === 'original' ? hexagram : changeHexagram)?.xiangCi}
                    </p>
                  </div>
                </div>

                <div className="font-traditional">
                  <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-traditional-red rounded-full"></div>
                    现代解析
                  </h3>
                  <div className="p-5 bg-ink/[0.01] rounded-2xl border border-ink/5">
                    <p className="text-base leading-relaxed text-ink/70 whitespace-pre-wrap">
                      {(activeGua === 'original' ? hexagram : changeHexagram)?.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'yao' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 font-traditional"
              >
                {(activeGua === 'original' ? hexagram : changeHexagram)?.yaoCi.map((yao, idx) => {
                  // 判断是否是动爻或关键爻
                  let isKeyYao = false;
                  let highlightType: 'moving' | 'static' | 'none' = 'none';

                  if (activeGua === 'original') {
                    // 本卦视角：仅在需要看本卦爻辞的情况下高亮
                    if (movingCount === 1 || movingCount === 2) {
                      // 一个或两个动爻：看本卦中的动爻
                      isKeyYao = movingIndices.includes(idx);
                      highlightType = isKeyYao ? 'moving' : 'none';
                    } else if (movingCount === 6 && (binary === "111111" || binary === "000000")) {
                      // 乾坤六爻全变：看用九/用六（第7个爻）
                      isKeyYao = idx === 6;
                      highlightType = isKeyYao ? 'moving' : 'none';
                    }
                    // 注意：当动爻为3、4、5个时，本卦视角不应高亮任何爻辞，以免误导
                  } else {
                    // 变卦视角：根据断卦规则显示关键爻
                    if (movingCount === 4) {
                      // 四个动爻：看变卦中剩下的两个不变爻（静爻）
                      isKeyYao = !movingIndices.includes(idx) && idx < 6;
                      highlightType = isKeyYao ? 'static' : 'none';
                    } else if (movingCount === 5) {
                      // 五个动爻：看变卦中唯一静爻
                      isKeyYao = !movingIndices.includes(idx) && idx < 6;
                      highlightType = isKeyYao ? 'static' : 'none';
                    } else if (movingCount === 6 && binary !== "111111" && binary !== "000000") {
                      // 六个动爻（非乾坤）：看变卦卦辞，此处高亮变卦所有爻作为参考
                      isKeyYao = true;
                      highlightType = 'moving';
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-2xl transition-all duration-300 border ${
                        highlightType === 'moving' 
                          ? 'bg-traditional-red/[0.03] border-traditional-red/20 shadow-sm' 
                          : highlightType === 'static'
                            ? 'bg-ink/[0.03] border-ink/20 shadow-sm'
                            : 'bg-white border-ink/5 opacity-60 grayscale-[0.5]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            highlightType === 'moving' 
                              ? 'bg-traditional-red text-white' 
                              : highlightType === 'static'
                                ? 'bg-ink text-white'
                                : 'bg-ink/10 text-ink/40'
                          }`}>
                            {['初爻', '二爻', '三爻', '四爻', '五爻', '上爻', binary === "111111" ? '用九' : '用六'][idx]}
                          </span>
                          <span className="text-lg font-bold text-ink">
                            {yao.ci.split('。')[0]}
                          </span>
                        </div>
                        {highlightType !== 'none' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            highlightType === 'moving' ? 'bg-traditional-red/10 text-traditional-red' : 'bg-ink/10 text-ink/60'
                          }`}>
                            {highlightType === 'moving' ? '动爻 · 重点参考' : '不变爻 · 重点参考'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink/60 italic mb-3">{yao.xiang}</p>
                      <div className="pl-4 border-l-2 border-ink/5 mb-3">
                        <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{yao.explanation}</p>
                      </div>
                      
                      {yao.shaoYong && (
                        <div className="bg-ink/[0.02] p-3 rounded-xl border border-ink/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1 h-3 bg-traditional-red/40 rounded-full"></div>
                            <span className="text-[10px] font-bold text-ink/40 tracking-wider">北宋易学家邵雍解</span>
                          </div>
                          <p className="text-xs text-ink/70 leading-relaxed italic">{yao.shaoYong}</p>
                        </div>
                      )}
                    </div>
                  );
                }).reverse()}
              </motion.div>
            )}

            {activeTab === 'expert' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {expertSections.map((section, idx) => (
                  <div key={idx} className="font-traditional">
                    <h3 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-traditional-red rounded-full"></div>
                      {section.title}
                    </h3>
                    <div className="p-5 bg-ink/[0.01] rounded-2xl border border-ink/5">
                      <p className="text-base leading-relaxed text-ink/70 whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Action: Restart (Always visible for convenience) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
      >
        <motion.button
          initial={{ backgroundColor: "#b72326" }}
          animate={{ backgroundColor: "#b72326" }}
          whileHover={{ scale: 1.05, translateY: -2, backgroundColor: "#991b1b" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{ backgroundColor: "#b72326" }}
          className="group relative flex items-center gap-3 px-8 py-3 text-white rounded-full shadow-[0_10px_30px_rgba(183,35,38,0.3)] border border-white/10 overflow-hidden transition-all duration-300 pointer-events-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="text-lg font-calligraphy relative z-10 tracking-[0.15em]">再次占卜</span>
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700 relative z-10">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 stroke-white stroke-2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};
