import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ConceptData } from '../types';
import { Play, Pause, RefreshCw, Volume2, Cpu } from 'lucide-react';

interface ConceptVisualizerProps {
  data: ConceptData;
  audioBuffer: AudioBuffer | null;
}

const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ data, audioBuffer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Initialize Audio Context on mount
  useEffect(() => {
    // Setup context
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new Ctx({ sampleRate: 24000 });

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(() => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Create a new source node
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    // Handle offset for pause/resume functionality
    const offset = pauseTimeRef.current % audioBuffer.duration;
    
    source.start(0, offset);
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    
    sourceNodeRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
        // Determine if it ended naturally or was stopped
        if (audioContextRef.current && (audioContextRef.current.currentTime - startTimeRef.current >= audioBuffer.duration - 0.1)) {
           setIsPlaying(false);
           pauseTimeRef.current = 0; // Reset
        }
    };
  }, [audioBuffer]);

  const pauseAudio = useCallback(() => {
    if (!audioContextRef.current) return;
    
    stopAudio();
    pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
  }, [stopAudio]);

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const restartAudio = () => {
    stopAudio();
    pauseTimeRef.current = 0;
    setTimeout(() => playAudio(), 100);
  };

  // Reset audio state when data changes
  useEffect(() => {
    stopAudio();
    pauseTimeRef.current = 0;
  }, [data, stopAudio]);

  return (
    <div className="flex flex-col h-full w-full px-4 pt-2 pb-6 gap-4 animate-fade-in relative z-10">
      
      {/* Header Bar */}
      <div className="flex-none flex justify-between items-center border-b border-sciviz-accent/30 pb-3 bg-black/40 px-4 rounded-t-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-sciviz-accent rounded-sm shadow-[0_0_10px_#06b6d4]"></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
            {data.title}
          </h2>
        </div>
        
        {/* Audio Controls */}
        <div className="flex items-center gap-3">
          {audioBuffer && (
            <div className="flex items-center gap-2 bg-slate-900/80 rounded-full p-1.5 border border-sciviz-accent/40 shadow-[0_0_15px_-5px_#06b6d4]">
               <button 
                onClick={togglePlayback}
                className="p-2 rounded-full hover:bg-sciviz-accent/20 transition-all active:scale-95"
                title={isPlaying ? "暂停讲解" : "播放讲解"}
              >
                {isPlaying ? <Pause className="w-5 h-5 text-sciviz-glow" /> : <Play className="w-5 h-5 text-sciviz-success" />}
              </button>
              <div className="w-px h-4 bg-slate-700"></div>
              <button 
                onClick={restartAudio}
                className="p-2 rounded-full hover:bg-slate-700 transition-all active:scale-95"
                title="重播"
              >
                <RefreshCw className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Expanded Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* SVG Visualization Container - Maximized */}
        <div className="flex-grow lg:w-3/4 relative group">
           {/* Decorative Corners */}
           <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-sciviz-accent rounded-tl-lg z-20"></div>
           <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-sciviz-accent rounded-tr-lg z-20"></div>
           <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-sciviz-accent rounded-bl-lg z-20"></div>
           <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-sciviz-accent rounded-br-lg z-20"></div>

           <div className="w-full h-full bg-[#050b14] rounded-lg border border-slate-800 shadow-[inset_0_0_60px_-10px_rgba(6,182,212,0.15)] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
             
             {/* Tech Grid Background */}
             <div className="absolute inset-0 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)', 
                    backgroundSize: '50px 50px' 
                  }}>
             </div>
             <div className="absolute inset-0 pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)', 
                    backgroundSize: '10px 10px' 
                  }}>
             </div>

             {/* SVG Renderer */}
             <div 
               className="w-full h-full p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:filter [&>svg]:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
               dangerouslySetInnerHTML={{ __html: data.svgCode }} 
             />
             
             {/* Overlay Badge */}
             <div className="absolute bottom-4 right-4 text-[10px] text-sciviz-accent/40 font-mono tracking-[0.2em] border border-sciviz-accent/20 px-2 py-1 rounded">
               SYSTEM: ONLINE // RENDER_MODE: HOLOGRAPHIC
             </div>
           </div>
        </div>

        {/* Explanation Side Panel */}
        <div className="flex-none lg:w-1/4 h-[200px] lg:h-full flex flex-col bg-slate-900/60 rounded-lg border border-slate-700/50 backdrop-blur-md shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 p-3 bg-slate-900/80 border-b border-sciviz-accent/20">
                <Cpu className="w-4 h-4 text-sciviz-accent animate-pulse" />
                <h3 className="font-semibold text-sm uppercase tracking-widest text-sciviz-glow">原理分析核心</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="text-slate-300 leading-7 text-base font-light text-justify tracking-wide">
                    {data.explanation}
                </div>
            </div>

            {/* Decorative data stream at bottom of panel */}
            <div className="h-6 bg-black/40 border-t border-slate-800 flex items-center px-2 gap-1 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div className="text-[10px] text-slate-600 font-mono whitespace-nowrap overflow-hidden">
                DATA_STREAM_RECEIVED: {Math.random().toString(36).substring(7).toUpperCase()}...
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptVisualizer;