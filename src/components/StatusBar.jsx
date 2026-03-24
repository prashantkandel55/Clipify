import React from 'react';
import { useStore } from '../store/useStore';

function StatusBar() {
  const { clips, videoMeta, isAnalyzing, getSelectedClipsForExport } = useStore();
  
  const selectedCount = getSelectedClipsForExport().length;
  
  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  return (
    <div className="h-8 panel flex items-center justify-between px-4 text-xs" style={{ 
      borderTop: '1px solid var(--border-color)',
      color: 'var(--text-secondary)'
    }}>
      <div className="flex items-center gap-4">
        <span>Clips: {clips.length}</span>
        {selectedCount > 0 && (
          <span style={{ color: 'var(--accent)' }}>Selected: {selectedCount}</span>
        )}
        {videoMeta && (
          <>
            <span>Format: {videoMeta.format?.toUpperCase()}</span>
            <span>Size: {formatSize(videoMeta.size)}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isAnalyzing && (
          <span className="flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent analyzing-pulse" />
            Processing
          </span>
        )}
        <span>9:16 Shorts</span>
        <span style={{ color: 'var(--accent)' }}>Clipify v1.0.0</span>
      </div>
    </div>
  );
}

export default StatusBar;
