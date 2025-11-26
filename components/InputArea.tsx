import React, { useState } from 'react';
import { Send, Sparkles, Database } from 'lucide-react';
import { LoadingStage } from '../types';

interface InputAreaProps {
  onSubmit: (prompt: string) => void;
  loadingStage: LoadingStage;
}

const InputArea: React.FC<InputAreaProps> = ({ onSubmit, loadingStage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && loadingStage === LoadingStage.IDLE || loadingStage === LoadingStage.COMPLETE || loadingStage === LoadingStage.ERROR) {
      onSubmit(input);
      setInput('');
    }
  };

  const isLoading = loadingStage === LoadingStage.GENERATING_VISUAL || loadingStage === LoadingStage.GENERATING_AUDIO;

  let loadingText = "";
  if (loadingStage === LoadingStage.GENERATING_VISUAL) loadingText = "正在构建全息结构模型...";
  if (loadingStage === LoadingStage.GENERATING_AUDIO) loadingText = "正在合成智能语音讲解...";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-sciviz-dark/80 backdrop-blur-xl border-t border-slate-800/80 p-4 z-50 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
          
          {isLoading && (
            <div className="absolute -top-12 left-0 w-full flex justify-center">
               <div className="bg-slate-900/90 text-sciviz-accent px-4 py-1 rounded-full text-xs font-mono border border-sciviz-accent/30 shadow-[0_0_15px_-3px_#06b6d4] flex items-center gap-2 animate-bounce">
                  <Database className="w-3 h-3 animate-pulse" />
                  {loadingText}
               </div>
            </div>
          )}

          <div className="relative flex-1 group">
            {/* Glowing input border effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-300 ${isLoading ? 'opacity-50 animate-pulse' : ''}`}></div>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入科学术语 (例如: 量子纠缠, 内燃机, 光合作用)..."
              disabled={isLoading}
              className="relative w-full bg-[#0b1120] text-white rounded-lg pl-5 pr-12 py-3.5 border border-slate-700 focus:outline-none focus:border-sciviz-accent/50 focus:ring-1 focus:ring-sciviz-accent/50 placeholder-slate-500 shadow-inner font-light tracking-wide transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="relative bg-sciviz-accent hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold p-3.5 rounded-lg transition-all duration-200 shadow-[0_0_20px_-5px_#06b6d4] hover:shadow-[0_0_30px_-5px_#06b6d4] flex items-center justify-center min-w-[3.5rem]"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputArea;