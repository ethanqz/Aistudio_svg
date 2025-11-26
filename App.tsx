import React, { useState } from 'react';
import { LoadingStage, ConceptData } from './types';
import { generateConcept, generateSpeech } from './services/geminiService';
import InputArea from './components/InputArea';
import ConceptVisualizer from './components/ConceptVisualizer';
import { Atom, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(LoadingStage.IDLE);
  const [conceptData, setConceptData] = useState<ConceptData | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (prompt: string) => {
    try {
      setError(null);
      setConceptData(null);
      setAudioBuffer(null);
      
      // Step 1: Generate Visuals and Text
      setLoadingStage(LoadingStage.GENERATING_VISUAL);
      const data = await generateConcept(prompt);
      setConceptData(data);

      // Step 2: Generate Audio
      setLoadingStage(LoadingStage.GENERATING_AUDIO);
      const buffer = await generateSpeech(data.explanation);
      setAudioBuffer(buffer);

      setLoadingStage(LoadingStage.COMPLETE);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "未知错误，请重试。");
      setLoadingStage(LoadingStage.ERROR);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-sciviz-dark text-slate-200">
      
      {/* Background decoration - Neural Network Vibe */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-sciviz-dark to-black -z-20"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
         <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sciviz-accent/10 rounded-full blur-[100px]"></div>
         <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Top Navigation / Brand */}
      <header className="flex-none py-3 px-4 flex items-center justify-center gap-3 border-b border-slate-800/60 bg-black/30 backdrop-blur-md z-20">
        <div className="relative">
          <div className="absolute inset-0 bg-sciviz-accent/30 blur-md rounded-full"></div>
          <Atom className="relative w-7 h-7 text-sciviz-accent animate-spin-slow" style={{ animationDuration: '8s' }} />
        </div>
        <div className="flex flex-col items-start">
            <h1 className="text-xl font-bold tracking-[0.2em] text-white leading-none">
            SCIVIZ <span className="text-sciviz-accent">GENAI</span>
            </h1>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase">全息科学可视化系统</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden pb-24 relative flex flex-col z-10">
        {error && (
          <div className="mx-auto mt-8 max-w-md p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-200 text-center shadow-lg backdrop-blur-sm">
            <p className="font-bold mb-1">系统错误</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!conceptData && !loadingStage.startsWith('GENERATING') && !error && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center animate-fade-in">
            <div className="relative mb-8 group cursor-default">
              <div className="absolute -inset-4 bg-sciviz-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <Atom className="w-32 h-32 text-slate-800 opacity-80 group-hover:text-sciviz-accent/50 transition duration-500" />
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-sciviz-accent opacity-0 group-hover:opacity-100 transition duration-300" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-4 tracking-wide">
              探索科学真理
            </h2>
            <p className="max-w-lg text-slate-400 leading-relaxed font-light">
              输入任何科学术语或技术概念，AI 将为您生成<span className="text-sciviz-accent font-normal">动态全息结构图</span>、<span className="text-sciviz-accent font-normal">深度原理解析</span>以及<span className="text-sciviz-accent font-normal">智能语音讲解</span>。
            </p>
            
            <div className="mt-8 flex gap-3 opacity-60">
                {["相对论", "CRISPR", "戴森球"].map(term => (
                    <span key={term} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">
                        {term}
                    </span>
                ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loadingStage.startsWith('GENERATING') && !conceptData && (
           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                 <div className="absolute inset-0 border-[3px] border-slate-800 rounded-full"></div>
                 <div className="absolute inset-0 border-[3px] border-sciviz-accent border-t-transparent border-l-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-4 border-[2px] border-purple-500/50 border-b-transparent rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
                 <Atom className="w-10 h-10 text-white animate-pulse" />
              </div>
              <p className="mt-8 text-sciviz-accent font-mono text-sm tracking-widest animate-pulse">
                AI_CORE_PROCESSING...
              </p>
           </div>
        )}

        {/* Visualizer Result */}
        {conceptData && (
          <ConceptVisualizer 
            data={conceptData} 
            audioBuffer={audioBuffer} 
          />
        )}
      </main>

      {/* Footer Input */}
      <InputArea onSubmit={handleSearch} loadingStage={loadingStage} />
      
    </div>
  );
};

export default App;