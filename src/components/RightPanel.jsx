import React from 'react';

function RightPanel({
  activeTab,
  onTabChange,
  captionSettings,
  onCaptionSettingsChange,
  styleSettings,
  onStyleSettingsChange,
  selectedClip,
  onClipUpdate,
  clips,
  transcription,
}) {
  const tabs = [
    { id: 'captions', label: 'Captions' },
    { id: 'clip', label: 'Clip' },
    { id: 'style', label: 'Style' },
    { id: 'insights', label: 'AI Insights' },
  ];

  const fonts = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat'];
  const backgroundOptions = ['blur', 'color', 'mirror', 'solid'];

  const handleLogoUpload = async () => {
    const logoPath = await window.electronAPI.selectLogo();
    if (logoPath) {
      onStyleSettingsChange({ ...styleSettings, logoPath });
    }
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-accent border-b-2 border-accent bg-gray-700/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'captions' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Caption Style</label>
              <select
                value={captionSettings.style}
                onChange={(e) => onCaptionSettingsChange({ ...captionSettings, style: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              >
                <option value="word">Word (Karaoke)</option>
                <option value="line">Line</option>
                <option value="block">Block</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Font Size: {captionSettings.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="48"
                value={captionSettings.fontSize}
                onChange={(e) => onCaptionSettingsChange({ ...captionSettings, fontSize: parseInt(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Caption Color</label>
              <input
                type="color"
                value={captionSettings.color}
                onChange={(e) => onCaptionSettingsChange({ ...captionSettings, color: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Highlight Color</label>
              <input
                type="color"
                value={captionSettings.highlightColor}
                onChange={(e) => onCaptionSettingsChange({ ...captionSettings, highlightColor: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Position</label>
              <select
                value={captionSettings.position}
                onChange={(e) => onCaptionSettingsChange({ ...captionSettings, position: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'clip' && selectedClip && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Clip Start</label>
              <input
                type="number"
                step="0.1"
                value={selectedClip.startTime}
                onChange={(e) => {
                  const newStart = parseFloat(e.target.value);
                  onClipUpdate({
                    ...selectedClip,
                    startTime: newStart,
                    duration: selectedClip.endTime - newStart,
                  });
                }}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Clip End</label>
              <input
                type="number"
                step="0.1"
                value={selectedClip.endTime}
                onChange={(e) => {
                  const newEnd = parseFloat(e.target.value);
                  onClipUpdate({
                    ...selectedClip,
                    endTime: newEnd,
                    duration: newEnd - selectedClip.startTime,
                  });
                }}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Duration</label>
              <input
                type="number"
                step="0.1"
                value={selectedClip.duration}
                readOnly
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={selectedClip.description}
                onChange={(e) => onClipUpdate({ ...selectedClip, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">AI Score</span>
                <span className="text-lg font-bold text-accent">{selectedClip.score}%</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clip' && !selectedClip && (
          <div className="text-center text-gray-500 py-8">
            <p>Select a clip to edit its properties</p>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Logo Watermark</label>
              {styleSettings.logoPath ? (
                <div className="relative">
                  <img
                    src={`file://${styleSettings.logoPath}`}
                    alt="Logo"
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  <button
                    onClick={() => onStyleSettingsChange({ ...styleSettings, logoPath: '' })}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogoUpload}
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:border-accent hover:text-accent transition-colors"
                >
                  Upload Logo
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Caption Font</label>
              <select
                value={styleSettings.font}
                onChange={(e) => onStyleSettingsChange({ ...styleSettings, font: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Background Fill</label>
              <select
                value={styleSettings.backgroundFill}
                onChange={(e) => onStyleSettingsChange({ ...styleSettings, backgroundFill: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-accent"
              >
                {backgroundOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {transcription ? (
              <>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Transcription Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span>{transcription.duration?.toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Segments</span>
                      <span>{transcription.segments?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Words</span>
                      <span>{transcription.words?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Clip Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Clips</span>
                      <span>{clips.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">High Score (80+)</span>
                      <span className="text-green-400">{clips.filter(c => c.score >= 80).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Medium Score (60-79)</span>
                      <span className="text-yellow-400">{clips.filter(c => c.score >= 60 && c.score < 80).length}</span>
                    </div>
                  </div>
                </div>

                {selectedClip && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Clip Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedClip.keywords?.map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Import and analyze a video to see AI insights</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RightPanel;
