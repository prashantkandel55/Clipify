import { create } from 'zustand';

export const useStore = create((set, get) => ({
  videoPath: null,
  videoMeta: null,
  transcript: [],
  clips: [],
  selectedClipId: null,
  isAnalyzing: false,
  analyzeProgress: '',
  exportQueue: [],
  isExporting: false,
  
  captionSettings: {
    style: 'word',
    fontSize: 20,
    color: '#FFFFFF',
    highlightColor: '#534AB7',
    position: 'bottom',
    font: 'Inter',
    animation: 'none',
    stroke: false,
  },
  
  styleSettings: {
    backgroundFill: 'blur',
    fillColor: '#000000',
    logoPath: null,
    logoPosition: 'top-right',
    logoOpacity: 0.8,
    introEnabled: false,
    introText: '',
    outroEnabled: false,
    outroText: '',
  },
  
  clipTabSettings: {
    speed: 1,
    trimSilence: false,
    platform: 'shorts',
  },
  
  playbackState: {
    isPlaying: false,
    currentTime: 0,
    volume: 1,
  },
  
  setVideoPath: (path) => set({ videoPath: path }),
  setVideoMeta: (meta) => set({ videoMeta: meta }),
  setTranscript: (transcript) => set({ transcript }),
  setClips: (clips) => set({ clips }),
  selectClip: (id) => set({ selectedClipId: id }),
  updateClip: (id, updates) => set((state) => ({
    clips: state.clips.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  toggleClipExport: (id) => set((state) => ({
    clips: state.clips.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
  })),
  
  setAnalyzing: (isAnalyzing, progress = '') => set({ isAnalyzing, analyzeProgress: progress }),
  
  setCaptionSettings: (settings) => set((state) => ({
    captionSettings: { ...state.captionSettings, ...settings }
  })),
  
  setStyleSettings: (settings) => set((state) => ({
    styleSettings: { ...state.styleSettings, ...settings }
  })),
  
  setClipTabSettings: (settings) => set((state) => ({
    clipTabSettings: { ...state.clipTabSettings, ...settings }
  })),
  
  setPlaybackState: (state) => set((prev) => ({
    playbackState: { ...prev.playbackState, ...state }
  })),
  
  addToExportQueue: (clips) => set((state) => ({
    exportQueue: [...state.exportQueue, ...clips]
  })),
  
  removeFromExportQueue: (id) => set((state) => ({
    exportQueue: state.exportQueue.filter(c => c.id !== id)
  })),
  
  setExporting: (isExporting) => set({ isExporting }),
  
  reset: () => set({
    videoPath: null,
    videoMeta: null,
    transcript: [],
    clips: [],
    selectedClipId: null,
    isAnalyzing: false,
    analyzeProgress: '',
    exportQueue: [],
    isExporting: false,
  }),
  
  getSelectedClip: () => {
    const state = get();
    return state.clips.find(c => c.id === state.selectedClipId) || null;
  },
  
  getSelectedClipsForExport: () => {
    return get().clips.filter(c => c.selected);
  },
  
  getTotalClipsForExport: () => {
    return get().clips.length;
  },
}));
