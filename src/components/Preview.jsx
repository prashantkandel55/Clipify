import React, { useRef, useEffect, useState } from 'react';

function Preview({ currentFile, selectedClip, transcription, captionSettings, styleSettings }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);

  useEffect(() => {
    if (videoRef.current && selectedClip) {
      videoRef.current.currentTime = selectedClip.startTime;
    }
  }, [selectedClip]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (transcription?.segments) {
        const currentSegment = transcription.segments.find(
          seg => video.currentTime >= seg.start && video.currentTime <= seg.end
        );
        if (currentSegment?.words) {
          const wordIndex = currentSegment.words.findIndex(
            w => video.currentTime >= w.start && video.currentTime <= w.end
          );
          setActiveWordIndex(wordIndex);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [transcription, selectedClip]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-gray-500">Import a video to get started</p>
        </div>
      </div>
    );
  }

  const getCurrentCaption = () => {
    if (!transcription?.segments) return null;
    
    const segment = transcription.segments.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
    
    if (!segment) return null;

    if (captionSettings.style === 'word' && segment.words) {
      return (
        <div className="flex flex-wrap justify-center gap-1">
          {segment.words.map((word, idx) => (
            <span
              key={idx}
              className={`inline-block px-1 rounded ${
                idx === activeWordIndex 
                  ? `text-${captionSettings.highlightColor} font-bold scale-110` 
                  : ''
              }`}
              style={{
                color: idx === activeWordIndex ? captionSettings.highlightColor : captionSettings.color,
                fontWeight: idx === activeWordIndex ? 'bold' : 'normal',
                transform: idx === activeWordIndex ? 'scale(1.1)' : 'none',
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
        <p style={{ color: captionSettings.color }}>{segment.text}</p>
      );
    }

    if (captionSettings.style === 'block') {
      const nearbySegments = transcription.segments.filter(
        seg => seg.end >= currentTime - 2 && seg.start <= currentTime + 2
      );
      return (
        <div className="flex flex-col gap-1">
          {nearbySegments.map((seg, idx) => (
            <p key={idx} style={{ color: captionSettings.color }}>{seg.text}</p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-900 p-8">
      <div 
        className="relative bg-black rounded-lg overflow-hidden"
        style={{
          width: '360px',
          height: '640px',
          maxHeight: '70vh',
        }}
      >
        <video
          ref={videoRef}
          src={`file://${currentFile.path}`}
          className="w-full h-full object-cover"
          playsInline
        />
        
        <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
          <div 
            className="bg-black/70 px-4 py-2 rounded-lg"
            style={{
              position: captionSettings.position === 'top' ? 'absolute' : 'relative',
              top: captionSettings.position === 'top' ? '20px' : 'auto',
              bottom: captionSettings.position === 'top' ? 'auto' : '20px',
              fontSize: `${captionSettings.fontSize}px`,
            }}
          >
            {getCurrentCaption()}
          </div>
        </div>

        {styleSettings.logoPath && (
          <img
            src={`file://${styleSettings.logoPath}`}
            alt="Logo"
            className="absolute top-4 right-4 w-16 h-16 object-contain"
          />
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Preview;
