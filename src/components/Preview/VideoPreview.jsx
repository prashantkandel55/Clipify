import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function VideoPreview() {
  const videoRef = useRef(null);
  const { 
    videoPath, 
    videoMeta, 
    selectedClipId, 
    clips, 
    transcript,
    captionSettings,
    styleSettings,
    playbackState,
    setPlaybackState
  } = useStore();
  
  const [showCrop, setShowCrop] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const selectedClip = clips.find(c => c.id === selectedClipId);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setPlaybackState({ currentTime: video.currentTime });
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setPlaybackState({ isPlaying: false });
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  useEffect(() => {
    if (videoRef.current && selectedClip) {
      videoRef.current.currentTime = selectedClip.start;
    }
  }, [selectedClip]);
  
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (playbackState.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setPlaybackState({ isPlaying: !playbackState.isPlaying });
  }, [playbackState.isPlaying]);
  
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    video.currentTime = time;
    setPlaybackState({ currentTime: time });
  };
  
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const volume = parseFloat(e.target.value);
    video.volume = volume;
    setPlaybackState({ volume });
  };
  
  const getCurrentCaption = useCallback(() => {
    if (!transcript || transcript.length === 0) return null;
    
    const currentTime = playbackState.currentTime;
    const segment = transcript.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
    
    if (!segment) return null;
    
    if (captionSettings.style === 'word' && segment.words) {
      const activeWordIndex = segment.words.findIndex(
        w => currentTime >= w.start && currentTime <= w.end
      );
      
      return (
        <div className="flex flex-wrap justify-center gap-1">
          {segment.words.map((word, idx) => (
            <span
              key={idx}
              className={`caption-word ${idx === activeWordIndex ? 'active' : ''}`}
              style={{
                color: idx === activeWordIndex ? captionSettings.highlightColor : captionSettings.color,
                fontSize: `${captionSettings.fontSize}px`,
              }}
            >
              {word.word}
            </span>
          ))}
        </div>
      );
    }
    
    if (captionSettings.style === 'line') {
      return (
        <span style={{ color: captionSettings.color, fontSize: `${captionSettings.fontSize}px` }}>
          {segment.text}
        </span>
      );
    }
    
    if (captionSettings.style === 'block') {
      const nearbySegments = transcript.filter(
        seg => seg.end >= currentTime - 2 && seg.start <= currentTime + 2
      );
      return (
        <div className="flex flex-col gap-1">
          {nearbySegments.map((seg, idx) => (
            <span key={idx} style={{ color: captionSettings.color, fontSize: `${captionSettings.fontSize - 4}px` }}>
              {seg.text}
            </span>
          ))}
        </div>
      );
    }
    
    return null;
  }, [transcript, playbackState.currentTime, captionSettings]);
  
  if (!videoPath) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
            <svg className="w-10 h-10" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Import a video to get started</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{
          width: '360px',
          height: '640px',
          maxHeight: '70vh',
          background: '#000',
        }}
      >
        <video
          ref={videoRef}
          src={`file://${videoPath}`}
          className="w-full h-full"
          playsInline
          onClick={togglePlay}
        />
        
        {captionSettings.style !== 'none' && (
          <div className={`caption-overlay ${captionSettings.position}`}>
            {getCurrentCaption()}
          </div>
        )}
        
        {styleSettings.logoPath && (
          <img
            src={`file://${styleSettings.logoPath}`}
            alt="Logo"
            className="absolute object-contain"
            style={{
              width: '60px',
              height: '60px',
              opacity: styleSettings.logoOpacity,
              top: '16px',
              right: '16px',
            }}
          />
        )}
        
        {showCrop && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 top-0 bottom-0 w-[135px] bg-black/60" style={{ clipPath: 'polygon(0 0, 100% 0, 30% 100%, 0 100%)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-[135px] bg-black/60" style={{ clipPath: 'polygon(70% 0, 100% 0, 100% 100%, 0 100%)' }} />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div 
            className="h-1 rounded-full cursor-pointer mb-3"
            style={{ background: 'rgba(255,255,255,0.3)' }}
            onClick={handleSeek}
          >
            <div 
              className="h-full rounded-full"
              style={{ 
                background: 'var(--accent)', 
                width: `${(playbackState.currentTime / duration) * 100}%` 
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="btn-icon" onClick={togglePlay}>
                {playbackState.isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={playbackState.volume}
                  onChange={handleVolumeChange}
                  className="slider w-20"
                />
              </div>
              
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(playbackState.currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <button 
              className={`btn-icon ${showCrop ? 'bg-accent' : ''}`}
              onClick={() => setShowCrop(!showCrop)}
              title="Toggle 9:16 crop preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 18h16M4 6v12M20 6v12" />
              </svg>
            </button>
          </div>
        </div>
        
        {selectedClip && (
          <div className="absolute top-4 left-4 px-2 py-1 rounded text-xs" style={{ background: 'var(--accent)' }}>
            {selectedClip.title || 'Selected Clip'}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPreview;
