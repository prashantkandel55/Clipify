const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipify', {
  openFile: () => ipcRenderer.invoke('open-file'),
  getVideoMeta: (filePath) => ipcRenderer.invoke('get-video-meta', filePath),
  generateThumbnail: (filePath, timestamp) => ipcRenderer.invoke('generate-thumbnail', filePath, timestamp),
  extractAudio: (filePath) => ipcRenderer.invoke('extract-audio', filePath),
  transcribe: (filePath) => ipcRenderer.invoke('transcribe', filePath),
  detectClips: (transcriptData) => ipcRenderer.invoke('detect-clips', transcriptData),
  exportClip: (options) => ipcRenderer.invoke('export-clip', options),
  downloadYoutube: (url) => ipcRenderer.invoke('download-youtube', url),
  selectLogo: () => ipcRenderer.invoke('select-logo'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  saveFile: (defaultName) => ipcRenderer.invoke('save-file', defaultName),
  checkFFmpeg: () => ipcRenderer.invoke('check-ffmpeg'),
  checkWhisper: () => ipcRenderer.invoke('check-whisper'),
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  showInFolder: (path) => ipcRenderer.invoke('show-in-folder', path),
  
  onTranscribeProgress: (callback) => {
    ipcRenderer.on('transcribe-progress', (event, progress) => callback(progress));
  },
  
  onYoutubeProgress: (callback) => {
    ipcRenderer.on('youtube-progress', (event, progress) => callback(progress));
  },
  
  onExportProgress: (callback) => {
    ipcRenderer.on('export-progress', (event, progress) => callback(progress));
  },
  
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
