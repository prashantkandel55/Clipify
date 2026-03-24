import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

function Sidebar({ onDropFile, onYouTubeImport }) {
  const { 
    clips, 
    selectedClipId, 
    selectClip, 
    toggleClipExport, 
    isAnalyzing,
    videoPath 
  } = useStore();
  
  const [showYouTube, setShowYouTube] = useState(false);
  const [youTubeUrl, setYouTubeUrl] = useState('');
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    const loadThumbnails = async () => {
      for (const clip of clips) {
        if (!thumbnails[clip.id] && clip.thumbnail) {
          setThumbnails(prev => ({ ...prev, [clip.id]: clip.thumbnail }));
        }
      }
    };
    loadThumbnails();
  }, [clips]);

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    return `${Math.round(seconds)}s`;
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const handleYouTubeSubmit = () => {
    if (youTubeUrl.trim()) {
      onYouTubeImport(youTubeUrl);
      setShowYouTube(false);
      setYouTubeUrl('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onDropFile(files[0].path);
    }
  };

  const handleClick = async () => {
    const filePath = await window.clipify.openFile();
    if (filePath) {
      onDropFile(filePath);
    }
  };

  if (!videoPath && clips.length === 0) {
    return (
      <div className="w-72 panel flex flex-col" style={{ borderRight: '1px solid var(--border-color)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clips
          </h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div 
            className="drop-zone w-full h-48 flex flex-col items-center justify-center cursor-pointer"
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Drop video here or click to browse</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>MP4, MOV, MKV, MP3, WAV</p>
          </div>
        </div>

        <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button 
            className="btn-secondary w-full"
            onClick={() => setShowYouTube(!showYouTube)}
          >
            Import from YouTube
          </button>
          {showYouTube && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="YouTube URL"
                value={youTubeUrl}
                onChange={(e) => setYouTubeUrl(e.target.value)}
                className="input-field"
              />
              <button className="btn-primary" onClick={handleYouTubeSubmit}>
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 panel flex flex-col" style={{ borderRight: '1px solid var(--border-color)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Detected Clips ({clips.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {clips.length === 0 && !isAnalyzing && (
          <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">No clips detected yet</p>
            <p className="text-xs mt-1">Click "Analyze" to detect clips</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="p-8 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing video...</p>
          </div>
        )}

        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className={`card p-3 cursor-pointer transition-all ${selectedClipId === clip.id ? 'border-l-2' : ''}`}
            style={{
              borderLeftColor: selectedClipId === clip.id ? 'var(--accent)' : 'transparent',
            }}
            onClick={() => selectClip(clip.id)}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-20 h-12 rounded overflow-hidden relative flex-shrink-0"
                style={{ background: 'var(--bg-primary)' }}
              >
                {thumbnails[clip.id] ? (
                  <img 
                    src={`file://${thumbnails[clip.id]}`} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{index + 1}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatTime(clip.start)} - {formatTime(clip.end)}
                  </span>
                  <span className={`score-badge ${getScoreClass(clip.score)}`}>
                    {clip.score}%
                  </span>
                </div>
                <p className="text-sm text-truncate" style={{ color: 'var(--text-primary)' }}>
                  {clip.title || clip.description?.substring(0, 50) || 'Untitled clip'}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDuration(clip.duration)}
                  </span>
                  <label 
                    className="flex items-center gap-1 text-xs cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={clip.selected || false}
                      onChange={() => toggleClipExport(clip.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    Export
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn-secondary w-full"
          onClick={() => setShowYouTube(!showYouTube)}
        >
          Import from YouTube
        </button>
        {showYouTube && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="YouTube URL"
              value={youTubeUrl}
              onChange={(e) => setYouTubeUrl(e.target.value)}
              className="input-field"
            />
            <button className="btn-primary" onClick={handleYouTubeSubmit}>
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
