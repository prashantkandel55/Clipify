# 🎬 Clipify

<p align="center">
  <img src="logo.png?v=2" alt="Clipify Logo" width="200"/>
</p>

<p align="center">
  <b>AI-Powered Video-to-Shorts Converter with Auto-Captions</b>
</p>

---

## ✨ Features

- **Video Import** - Drag & drop or file picker for MP4, MOV, MKV, MP3, WAV, M4A, WEBM
- **YouTube Import** - Download videos directly from YouTube URLs
- **AI Clip Detection** - Whisper-powered transcription with intelligent highlight detection
- **Auto Captions** - Word-level timestamps, karaoke-style highlighting
- **Customizable Styling** - Caption styles, fonts, colors, watermark logos
- **9:16 Export** - Vertical video optimized for TikTok, Reels, Shorts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Electron.js |
| Frontend | React |
| Styling | CSS (Dark theme) |
| Video Processing | FFmpeg |
| AI Transcription | OpenAI Whisper |
| YouTube Download | yt-dlp |
| Backend | Python |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (3.10+)
- **FFmpeg** - Add to system PATH

### Install Dependencies

```bash
cd clipify
npm install
```

### Install Python Packages

```bash
pip install openai-whisper yt-dlp
```

### Run Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 📋 Usage

1. **Import Video** - Click "Import File" or drag & drop a video file
2. **Analyze** - Click "Analyze" to transcribe and detect clips
3. **Select Clip** - Choose a clip from the sidebar
4. **Customize** - Adjust captions, styling in the right panel
5. **Export** - Click "Export Selected" to save the clip

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar: Logo | Filename | Import | Analyze | Export        │
├──────────┬──────────────────────────────┬──────────────────┤
│          │                              │                   │
│ Sidebar  │    Video Preview (9:16)      │   Right Panel    │
│  Clips   │                              │  Captions/Clip/  │
│  List    │                              │   Style/AI       │
│          │                              │                   │
├──────────┴──────────────────────────────┴──────────────────┤
│                      Timeline                                │
├──────────────────────────────────────────────────────────────┤
│ Status Bar                                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause video |
| Ctrl+O | Open file |

---

## ⚙️ Configuration

### Environment Variables

- `FFMPEG_PATH` - Path to FFmpeg executable
- `WHISPER_MODEL` - Whisper model size (base, small, medium, large)

### Supported Video Formats

- MP4, MOV, MKV, WEBM, AVI
- MP3, WAV, M4A, FLAC, OGG

---

## 🐛 Troubleshooting

### "Whisper not found"
```bash
pip install openai-whisper
```

### "FFmpeg not found"
Download from https://ffmpeg.org and add to PATH

### "YouTube download failed"
```bash
pip install yt-dlp
```

---

## 📄 License

MIT License

---

<p align="center">
  Made with ❤️ by <a href="https://clipify.app">Clipify</a>
</p>
