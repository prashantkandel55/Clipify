import React from 'react';
import { useStore } from '../store/useStore';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function TopBar({ onImportFile, onAnalyze, onExportAll }) {
  const { videoPath, videoMeta, clips, isAnalyzing, analyzeProgress, getSelectedClipsForExport } = useStore();
  
  const selectedCount = getSelectedClipsForExport().length;
  
  return (
    <header className="h-14 panel flex items-center justify-between px-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-4">
        <h1 className="logo-text text-2xl font-bold flex items-center gap-1">
          <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
          </svg>
          <span className="clip">Clip</span>
          <span className="ify">ify</span>
        </h1>
        
        {videoMeta && (
          <div className="flex items-center gap-3 text-sm text-secondary">
            <span className="text-primary">{videoMeta.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)' }}>{formatTime(videoMeta.duration)}</span>
            {videoMeta.width && videoMeta.height && (
              <span style={{ color: 'var(--text-muted)' }}>{videoMeta.width}x{videoMeta.height}</span>
            )}
          </div>
        )}
        
        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent analyzing-pulse" />
            <span className="text-sm text-accent">{analyzeProgress}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={onImportFile}>
          Import File
        </button>
        
        {videoPath && !isAnalyzing && (
          <button className="btn-primary" onClick={onAnalyze}>
            Analyze
          </button>
        )}
        
        {clips.length > 0 && (
          <button 
            className="btn-primary" 
            onClick={onExportAll}
            disabled={selectedCount === 0}
            style={{ 
              background: selectedCount > 0 ? 'var(--success)' : 'var(--bg-card)',
              borderColor: selectedCount > 0 ? 'var(--success)' : 'var(--border-color)'
            }}
          >
            Export {selectedCount > 0 ? `(${selectedCount})` : 'All'}
          </button>
        )}
      </div>
    </header>
  );
}

export default TopBar;
