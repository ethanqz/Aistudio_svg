export interface ConceptData {
  title: string;
  svgCode: string;
  explanation: string;
}

export interface AudioState {
  isPlaying: boolean;
  audioContext: AudioContext | null;
  audioBuffer: AudioBuffer | null;
  sourceNode: AudioBufferSourceNode | null;
}

export enum LoadingStage {
  IDLE = 'IDLE',
  GENERATING_VISUAL = 'GENERATING_VISUAL',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
