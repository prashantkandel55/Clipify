import React, { useState } from 'react';

function Sidebar({ clips, selectedClip, onClipSelect, onClipUpdate, transcription, isProcessing }) {
  const [youTubeUrl, setYouTubeUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (duration) => {
    const secs = Math.floor(duration);
    return `${secs}s`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const handleYouTubeImport = async () => {
    if (youTubeUrl.trim()) {
      setShowUrlInput(false);
    }
  };

  const toggleClipSelection = (clip, e) => {
    e.stopPropagation();
    onClipUpdate({ ...clip, selected: !clip.selected });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Clips</h2>
        
        {!clips.length && !isProcessing && (
          <div className="text-gray-500 text-sm text-center py-8">
            <p className="mb-2">No clips yet</p>
            <p className="text-xs">Import a video and click Analyze to detect clips</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {clips.map((clip) => (
          <div
            key={clip.id}
            onClick={() => onClipSelect(clip)}
            className={`p-3 border-b border-gray-700 cursor-pointer transition-colors ${
              selectedClip?.id === clip.id ? 'bg-accent/20 border-l-2 border-l-accent' : 'hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">
                    {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                  </span>
                  <span className={`text-xs font-medium ${getScoreColor(clip.score)}`}>
                    {clip.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{clip.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{formatDuration(clip.duration)}</span>
                  <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clip.selected || false}
                      onChange={(e) => toggleClipSelection(clip, e)}
                      className="w-3 h-3 rounded accent-accent"
                    />
                    Export
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="w-full py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Import from YouTube
        </button>
        {showUrlInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="YouTube URL"
              value={youTubeUrl}
              onChange={(e) => setYouTubeUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleYouTubeImport}
              className="px-3 py-2 bg-accent rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
