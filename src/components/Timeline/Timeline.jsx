import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';

function Timeline({ videoPath }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { 
    clips, 
    selectedClipId, 
    updateClip, 
    transcript,
    videoMeta,
    playbackState,
    setPlaybackState
  } = useStore();
  
  const [isDragging, setIsDragging] = useState(null);
  const [duration, setDuration] = useState(60);
  const [zoom, setZoom] = useState(1);
  
  const selectedClip = clips.find(c => c.id === selectedClipId);
  
  useEffect(() => {
    if (videoMeta?.duration) {
      setDuration(videoMeta.duration);
    }
  }, [videoMeta]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0f0f13';
    ctx.fillRect(0, 0, width, height);
    
    if (transcript && transcript.length > 0) {
      const scale = width / duration;
      
      ctx.fillStyle = '#534AB7';
      transcript.forEach(seg => {
        const x = seg.start * scale;
        const w = Math.max(1, (seg.end - seg.start) * scale);
        ctx.fillRect(x, 0, w, height * 0.4);
      });
      
      if (transcript[0]?.words) {
        ctx.fillStyle = '#7F77DD';
        transcript.forEach(seg => {
          if (seg.words) {
            seg.words.forEach(word => {
              const x = word.start * scale;
              const w = Math.max(1, (word.end - word.start) * scale);
              ctx.fillRect(x, height * 0.5, w, height * 0.5);
            });
          }
        });
      }
    }
  }, [transcript, duration, zoom]);
  
  const getPositionFromEvent = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(duration, (x / rect.width) * duration));
  }, [duration]);
  
  const handleTimelineClick = (e) => {
    const time = getPositionFromEvent(e);
    setPlaybackState({ currentTime: time });
  };
  
  const handleMouseDown = (type) => (e) => {
    e.stopPropagation();
    setIsDragging(type);
  };
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !selectedClip) return;
      
      const time = getPositionFromEvent(e);
      
      if (isDragging === 'start') {
        const maxStart = selectedClip.end - 1;
        const newStart = Math.max(0, Math.min(time, maxStart));
        updateClip(selectedClip.id, {
          start: newStart,
          duration: selectedClip.end - newStart
        });
      } else if (isDragging === 'end') {
        const minEnd = selectedClip.start + 1;
        const newEnd = Math.min(time, duration);
        updateClip(selectedClip.id, {
          end: newEnd,
          duration: newEnd - selectedClip.start
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedClip, getPositionFromEvent, updateClip, duration]);
  
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const scale = 800 / duration;
  
  return (
    <div className="panel h-32 flex flex-col" style={{ borderTop: '1px solid var(--border-color)' }}>
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {selectedClip ? formatTime(selectedClip.start) : '0:00'}
          </span>
          {selectedClip && (
            <span className="text-xs" style={{ color: 'var(--accent)' }}>
              Duration: {selectedClip.duration?.toFixed(1)}s
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {selectedClip ? formatTime(selectedClip.end) : formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="btn-icon"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{zoom}x</span>
          <button 
            className="btn-icon"
            onClick={() => setZoom(Math.min(4, zoom + 0.5))}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative flex-1 mx-4 mb-3 rounded-lg overflow-hidden cursor-pointer"
        style={{ background: 'var(--bg-primary)' }}
        onClick={handleTimelineClick}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          className="absolute inset-0 w-full h-full"
        />
        
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="absolute top-0 bottom-0 bg-accent/20 border-l-2 border-r-2 border-accent/50"
            style={{
              left: `${clip.start * scale}px`,
              width: `${clip.duration * scale}px`,
              borderColor: selectedClipId === clip.id ? 'var(--accent)' : 'rgba(83, 74, 183, 0.5)',
              backgroundColor: selectedClipId === clip.id ? 'rgba(83, 74, 183, 0.3)' : 'rgba(83, 74, 183, 0.2)',
            }}
          />
        ))}
        
        {selectedClip && (
          <>
            <div
              className="absolute top-0 bottom-0 w-2 bg-accent cursor-ew-resize hover:bg-white z-10"
              style={{ left: `${selectedClip.start * scale}px` }}
              onMouseDown={handleMouseDown('start')}
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1 h-8 bg-white rounded-full" />
            </div>
            
            <div
              className="absolute top-0 bottom-0 w-2 bg-accent cursor-ew-resize hover:bg-white z-10"
              style={{ left: `${selectedClip.end * scale}px` }}
              onMouseDown={handleMouseDown('end')}
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1 h-8 bg-white rounded-full" />
            </div>
          </>
        )}
        
        <div 
          className="playhead"
          style={{
            left: `${playbackState.currentTime * scale}px`,
          }}
        />
      </div>
    </div>
  );
}

export default Timeline;
