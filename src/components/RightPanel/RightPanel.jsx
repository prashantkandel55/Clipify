import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

const COLORS = ['#FFFFFF', '#534AB7', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6'];

function RightPanel({ activeTab, onTabChange }) {
  const { 
    captionSettings, 
    setCaptionSettings,
    styleSettings,
    setStyleSettings,
    clipTabSettings,
    setClipTabSettings,
    selectedClipId,
    clips,
    transcript,
    updateClip
  } = useStore();
  
  const selectedClip = clips.find(c => c.id === selectedClipId);
  
  const tabs = [
    { id: 'captions', label: 'Captions' },
    { id: 'clip', label: 'Clip' },
    { id: 'style', label: 'Style' },
    { id: 'insights', label: 'AI Insights' },
  ];
  
  return (
    <div className="w-80 panel flex flex-col" style={{ borderLeft: '1px solid var(--border-color)' }}>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'captions' && (
          <CaptionsTab 
            settings={captionSettings} 
            onChange={setCaptionSettings} 
            transcript={transcript}
          />
        )}
        {activeTab === 'clip' && (
          <ClipTab 
            clip={selectedClip}
            onChange={(updates) => selectedClip && updateClip(selectedClip.id, updates)}
            settings={clipTabSettings}
            onSettingsChange={setClipTabSettings}
          />
        )}
        {activeTab === 'style' && (
          <StyleTab 
            settings={styleSettings} 
            onChange={setStyleSettings} 
          />
        )}
        {activeTab === 'insights' && (
          <AIInsightsTab 
            clip={selectedClip}
            transcript={transcript}
            clips={clips}
          />
        )}
      </div>
    </div>
  );
}

function CaptionsTab({ settings, onChange, transcript }) {
  const [previewText, setPreviewText] = useState('This is a sample caption');
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Style</label>
        <div className="segmented-control">
          {['word', 'line', 'block', 'none'].map((style) => (
            <button
              key={style}
              className={settings.style === style ? 'active' : ''}
              onClick={() => onChange({ style })}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {settings.style !== 'none' && (
        <>
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="36"
              value={settings.fontSize}
              onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
              className="slider"
            />
          </div>
          
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Position</label>
            <div className="segmented-control">
              {['top', 'middle', 'bottom'].map((pos) => (
                <button
                  key={pos}
                  className={settings.position === pos ? 'active' : ''}
                  onClick={() => onChange({ position: pos })}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Caption Color</label>
            <div className="flex gap-2 mb-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-swatch ${settings.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onChange({ color })}
                />
              ))}
            </div>
            <input
              type="text"
              value={settings.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="input-field"
              placeholder="#FFFFFF"
            />
          </div>
          
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Highlight Color</label>
            <div className="flex gap-2 mb-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-swatch ${settings.highlightColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onChange({ highlightColor: color })}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Font</label>
            <select
              value={settings.font}
              onChange={(e) => onChange({ font: e.target.value })}
              className="input-field"
            >
              <option value="Inter">Inter</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Oswald">Oswald</option>
              <option value="Bebas Neue">Bebas Neue</option>
              <option value="Arial Black">Arial Black</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Animation</label>
            <select
              value={settings.animation}
              onChange={(e) => onChange({ animation: e.target.value })}
              className="input-field"
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="pop">Pop</option>
              <option value="typewriter">Typewriter</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Text Stroke</span>
            <div 
              className={`toggle ${settings.stroke ? 'active' : ''}`}
              onClick={() => onChange({ stroke: !settings.stroke })}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ClipTab({ clip, onChange, settings, onSettingsChange }) {
  if (!clip) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        <p>Select a clip to edit</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Clip Name</label>
        <input
          type="text"
          value={clip.title || ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className="input-field"
          placeholder="Enter clip name"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Start (s)</label>
          <input
            type="number"
            step="0.1"
            value={clip.start?.toFixed(1) || 0}
            onChange={(e) => onChange({ start: parseFloat(e.target.value) })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>End (s)</label>
          <input
            type="number"
            step="0.1"
            value={clip.end?.toFixed(1) || 0}
            onChange={(e) => onChange({ end: parseFloat(e.target.value) })}
            className="input-field"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Duration</label>
        <input
          type="text"
          value={`${clip.duration?.toFixed(1)}s`}
          readOnly
          className="input-field"
        />
      </div>
      
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Platform Preset</label>
        <div className="segmented-control">
          {['tiktok', 'reels', 'shorts'].map((p) => (
            <button
              key={p}
              className={settings.platform === p ? 'active' : ''}
              onClick={() => onSettingsChange({ platform: p })}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Speed</label>
        <div className="segmented-control">
          {['0.5', '1', '1.25', '1.5', '2'].map((speed) => (
            <button
              key={speed}
              className={settings.speed.toString() === speed ? 'active' : ''}
              onClick={() => onSettingsChange({ speed: parseFloat(speed) })}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Trim Silence</span>
        <div 
          className={`toggle ${settings.trimSilence ? 'active' : ''}`}
          onClick={() => onSettingsChange({ trimSilence: !settings.trimSilence })}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Auto-crop to Speaker</span>
        <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>Coming soon</span>
      </div>
    </div>
  );
}

function StyleTab({ settings, onChange }) {
  const handleLogoUpload = async () => {
    const logoPath = await window.clipify.selectLogo();
    if (logoPath) {
      onChange({ logoPath });
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Logo Watermark</label>
        {settings.logoPath ? (
          <div className="relative inline-block">
            <img
              src={`file://${settings.logoPath}`}
              alt="Logo"
              className="w-16 h-16 object-contain rounded"
            />
            <button
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
              style={{ background: 'var(--error)' }}
              onClick={() => onChange({ logoPath: null })}
            >
              ×
            </button>
          </div>
        ) : (
          <button className="btn-secondary w-full" onClick={handleLogoUpload}>
            Upload Logo
          </button>
        )}
      </div>
      
      {settings.logoPath && (
        <>
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Logo Position</label>
            <div className="grid grid-cols-2 gap-2">
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                <button
                  key={pos}
                  className={`btn-secondary text-xs ${settings.logoPosition === pos ? 'border-accent text-accent' : ''}`}
                  onClick={() => onChange({ logoPosition: pos })}
                >
                  {pos.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Logo Opacity: {Math.round(settings.logoOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={settings.logoOpacity}
              onChange={(e) => onChange({ logoOpacity: parseFloat(e.target.value) })}
              className="slider"
            />
          </div>
        </>
      )}
      
      <div>
        <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Background Fill</label>
        <div className="segmented-control">
          {['blur', 'mirror', 'color', 'gradient'].map((fill) => (
            <button
              key={fill}
              className={settings.backgroundFill === fill ? 'active' : ''}
              onClick={() => onChange({ backgroundFill: fill })}
            >
              {fill.charAt(0).toUpperCase() + fill.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {settings.backgroundFill === 'color' && (
        <div>
          <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Fill Color</label>
          <input
            type="color"
            value={settings.fillColor}
            onChange={(e) => onChange({ fillColor: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      )}
      
      <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Intro Card</span>
          <div 
            className={`toggle ${settings.introEnabled ? 'active' : ''}`}
            onClick={() => onChange({ introEnabled: !settings.introEnabled })}
          />
        </div>
        {settings.introEnabled && (
          <input
            type="text"
            value={settings.introText}
            onChange={(e) => onChange({ introText: e.target.value })}
            className="input-field"
            placeholder="Intro text..."
          />
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Outro Card</span>
          <div 
            className={`toggle ${settings.outroEnabled ? 'active' : ''}`}
            onClick={() => onChange({ outroEnabled: !settings.outroEnabled })}
          />
        </div>
        {settings.outroEnabled && (
          <input
            type="text"
            value={settings.outroText}
            onChange={(e) => onChange({ outroText: e.target.value })}
            className="input-field"
            placeholder="CTA text..."
          />
        )}
      </div>
    </div>
  );
}

function AIInsightsTab({ clip, transcript, clips }) {
  if (!clip) {
    return (
      <div className="space-y-4">
        {transcript && transcript.length > 0 && (
          <div className="card p-3">
            <h4 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Transcription Stats</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                <span>{transcript[transcript.length - 1]?.end?.toFixed(1) || 0}s</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Segments</span>
                <span>{transcript.length}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="card p-3">
          <h4 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Clip Analysis</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Total Clips</span>
              <span>{clips.length}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>High Score (80+)</span>
              <span style={{ color: 'var(--success)' }}>{clips.filter(c => c.score >= 80).length}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Medium Score (60-79)</span>
              <span style={{ color: 'var(--warning)' }}>{clips.filter(c => c.score >= 60 && c.score < 80).length}</span>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a clip to view detailed insights
        </p>
      </div>
    );
  }
  
  const getScoreReason = (score) => {
    if (score >= 80) return 'Strong hook detected';
    if (score >= 60) return 'Good engagement potential';
    return 'Moderate content';
  };
  
  return (
    <div className="space-y-4">
      <div className="card p-4 text-center">
        <div className="text-4xl font-bold mb-1" style={{ 
          color: clip.score >= 80 ? 'var(--success)' : clip.score >= 60 ? 'var(--warning)' : 'var(--error)'
        }}>
          {clip.score}
        </div>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Engagement Score</div>
        <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {getScoreReason(clip.score)}
        </div>
      </div>
      
      {clip.keywords && clip.keywords.length > 0 && (
        <div className="card p-3">
          <h4 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {clip.keywords.map((keyword, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(83, 74, 183, 0.2)', color: 'var(--accent)' }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="card p-3">
        <h4 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Transcript Excerpt</h4>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {clip.text?.substring(0, 200) || 'No transcript available'}
        </p>
      </div>
      
      <button className="btn-secondary w-full">
        Re-analyze Clip
      </button>
      
      {transcript && transcript.length > 0 && (
        <div className="card p-3" style={{ maxHeight: '200px', overflow: 'hidden' }}>
          <h4 className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Full Transcript</h4>
          <div className="overflow-y-auto" style={{ maxHeight: '150px' }}>
            {transcript.map((seg, idx) => (
              <p 
                key={idx} 
                className="text-xs mb-1"
                style={{ color: clip.start <= seg.start && seg.end <= clip.end ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>[{seg.start?.toFixed(1)}]</span> {seg.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RightPanel;
