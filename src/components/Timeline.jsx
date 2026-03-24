import React, { useRef, useEffect, useState } from 'react';

function Timeline({ selectedClip, transcription, onClipUpdate }) {
  const canvasRef = useRef(null);
  const timelineRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    if (transcription?.duration) {
      setDuration(transcription.duration);
    }
  }, [transcription]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    if (transcription?.segments) {
      const scale = width / duration;

      ctx.fillStyle = '#534AB7';
      transcription.segments.forEach(seg => {
        const x = seg.start * scale;
        const w = (seg.end - seg.start) * scale;
        ctx.fillRect(x, 0, w, height * 0.3);
      });

      if (transcription.words) {
        ctx.fillStyle = '#6c63c9';
        transcription.words.forEach(word => {
          const x = word.start * scale;
          const w = (word.end - word.start) * scale;
          ctx.fillRect(x, height * 0.5, w, height * 0.5);
        });
      }
    }
  }, [transcription, duration]);

  const getPositionFromEvent = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(duration, (x / rect.width) * duration));
  };

  const handleTimelineClick = (e) => {
    const time = getPositionFromEvent(e);
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
        const maxStart = selectedClip.endTime - 1;
        const newStart = Math.min(time, maxStart);
        onClipUpdate({
          ...selectedClip,
          startTime: newStart,
          duration: selectedClip.endTime - newStart,
        });
      } else if (isDragging === 'end') {
        const minEnd = selectedClip.startTime + 1;
        const newEnd = Math.max(time, minEnd);
        onClipUpdate({
          ...selectedClip,
          endTime: newEnd,
          duration: newEnd - selectedClip.startTime,
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
  }, [isDragging, selectedClip, onClipUpdate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedClip) {
    return (
      <div className="h-32 bg-gray-800 border-t border-gray-700 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Select a clip to edit timeline</p>
      </div>
    );
  }

  const scale = 600 / duration;

  return (
    <div className="h-32 bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          {formatTime(selectedClip.startTime)}
        </span>
        <span className="text-xs text-gray-400">
          Duration: {selectedClip.duration.toFixed(1)}s
        </span>
        <span className="text-xs text-gray-400">
          {formatTime(selectedClip.endTime)}
        </span>
      </div>

      <div 
        ref={timelineRef}
        className="relative h-16 bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
        onClick={handleTimelineClick}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="absolute inset-0"
        />

        <div
          className="absolute top-0 bottom-0 bg-accent/30 border-l-2 border-l-accent"
          style={{
            left: `${selectedClip.startTime * scale}px`,
            width: `${selectedClip.duration * scale}px`,
          }}
        />

        <div
          className="absolute top-0 bottom-0 w-2 bg-accent cursor-ew-resize hover:bg-white"
          style={{ left: `${selectedClip.startTime * scale}px` }}
          onMouseDown={handleMouseDown('start')}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1 h-8 bg-white rounded-full" />
        </div>

        <div
          className="absolute top-0 bottom-0 w-2 bg-accent cursor-ew-resize hover:bg-white"
          style={{ left: `${selectedClip.endTime * scale}px` }}
          onMouseDown={handleMouseDown('end')}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-1 h-8 bg-white rounded-full" />
        </div>

        {selectedClip.score !== undefined && (
          <div 
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-accent font-medium"
          >
            Score: {selectedClip.score}%
          </div>
        )}
      </div>
    </div>
  );
}

export default Timeline;
