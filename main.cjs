const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const log = require('electron-log');

log.transports.file.level = 'info';
log.transports.console.level = 'info';

let mainWindow;
let pythonProc = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    backgroundColor: '#0f0f13',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log.info('Main window ready');
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5180');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (pythonProc) {
    pythonProc.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Video/Audio', extensions: ['mp4', 'mov', 'mkv', 'mp3', 'wav', 'm4a', 'webm', 'avi', 'flac', 'ogg'] },
    ]
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('get-video-meta', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const probePath = 'ffprobe';
    const args = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath];

    exec(`${probePath} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        const stats = fs.statSync(filePath);
        resolve({
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          duration: 0,
          width: 0,
          height: 0,
          fps: 0,
          format: path.extname(filePath).slice(1)
        });
        return;
      }

      try {
        const info = JSON.parse(stdout);
        const videoStream = info.streams?.find(s => s.codec_type === 'video');
        const format = info.format;

        resolve({
          path: filePath,
          name: path.basename(filePath),
          size: parseInt(format?.size || 0),
          duration: parseFloat(format?.duration || 0),
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: eval(videoStream?.r_frame_rate || '0') || 0,
          format: path.extname(filePath).slice(1)
        });
      } catch (e) {
        const stats = fs.statSync(filePath);
        resolve({
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          duration: 0,
          width: 0,
          height: 0,
          fps: 0,
          format: path.extname(filePath).slice(1)
        });
      }
    });
  });
});

ipcMain.handle('transcribe', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    log.info('Starting transcription for:', filePath);
    
    const pythonScript = path.join(__dirname, 'backend', 'transcribe.py');
    const proc = spawn('python', [pythonScript, filePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      log.info('Transcribe stderr:', data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const lines = stdout.trim().split('\n');
          const result = JSON.parse(lines[lines.length - 1]);
          resolve(result);
        } catch (e) {
          log.error('JSON parse error:', e, stdout);
          reject(new Error('Failed to parse transcription result'));
        }
      } else {
        reject(new Error(stderr || 'Transcription failed'));
      }
    });

    proc.on('error', (err) => {
      log.error('Spawn error:', err);
      reject(err);
    });
  });
});

ipcMain.handle('detect-clips', async (event, transcriptData) => {
  return new Promise((resolve, reject) => {
    log.info('Starting clip detection');
    
    const pythonScript = path.join(__dirname, 'backend', 'detect_clips.py');
    const proc = spawn('python', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdin.write(JSON.stringify(transcriptData));
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          log.error('JSON parse error:', e, stdout);
          reject(new Error('Failed to parse clip detection result'));
        }
      } else {
        reject(new Error(stderr || 'Clip detection failed'));
      }
    });

    proc.on('error', (err) => {
      log.error('Spawn error:', err);
      reject(err);
    });
  });
});

ipcMain.handle('download-youtube', async (event, url) => {
  return new Promise((resolve, reject) => {
    log.info('Downloading YouTube video:', url);
    
    const os = require('os');
    const fs = require('fs');
    const tempDir = app.getPath('temp');
    const outputTemplate = path.join(tempDir, 'youtube_download.%(ext)s');
    
    // Use Python yt_dlp module
    const pythonPath = 'python';
    
    const command = pythonPath;
    const args = [
      '-m', 'yt_dlp',
      '-f', 'best[ext=mp4]/best',
      '--no-playlist',
      '--no-check-certificate',
      '-o', outputTemplate,
      url
    ];
    
    log.info('Running:', command, args.join(' '));
    
    const proc = spawn(command, args, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONPATH: path.join(os.homedir(), 'AppData', 'Local', 'Packages', 'PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0', 'LocalCache', 'local-packages', 'Python312', 'site-packages')
      }
    });

    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (data) => {
      const line = data.toString();
      stdoutData += line;
      log.info('yt-dlp:', line);
      if (mainWindow) {
        mainWindow.webContents.send('youtube-progress', line);
      }
    });

    proc.stderr.on('data', (data) => {
      const str = data.toString();
      stderrData += str;
      log.info('yt-dlp stderr:', str);
    });

    proc.on('close', (code) => {
      if (code === 0) {
        fs.readdir(tempDir, (err, files) => {
          if (err) {
            reject(err);
            return;
          }
          const videoFile = files.find(f => f.startsWith('youtube_download') && (f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.webm')));
          if (videoFile) {
            resolve(path.join(tempDir, videoFile));
          } else {
            reject(new Error('Downloaded file not found'));
          }
        });
      } else {
        reject(new Error(stderrData || 'YouTube download failed. Make sure yt-dlp is installed: pip install yt-dlp'));
      }
    });

    proc.on('error', (err) => {
      log.error('yt-dlp error:', err);
      reject(err);
    });
  });
});

ipcMain.handle('select-logo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('select-output-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('save-file', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
  });
  return result.filePath || null;
});

ipcMain.handle('export-clip', async (event, options) => {
  return new Promise((resolve, reject) => {
    log.info('Exporting clip:', options);
    
    const pythonScript = path.join(__dirname, 'backend', 'export.py');
    const args = [
      pythonScript,
      options.inputPath,
      options.outputPath,
      options.startTime.toString(),
      options.duration.toString(),
      JSON.stringify(options.captions || []),
      options.captionStyle || 'word',
      options.fontSize?.toString() || '20',
      options.captionColor || '#FFFFFF',
      options.highlightColor || '#534AB7',
      options.captionPosition || 'bottom',
      options.backgroundFill || 'blur',
    ];

    const proc = spawn('python', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
      log.info('Export stderr:', data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, outputPath: options.outputPath });
      } else {
        reject(new Error(stderr || 'Export failed. Make sure FFmpeg is installed.'));
      }
    });

    proc.on('error', (err) => {
      log.error('Export error:', err);
      reject(err);
    });
  });
});

ipcMain.handle('check-ffmpeg', async () => {
  return new Promise((resolve) => {
    exec('ffmpeg -version', (error) => {
      resolve(!error);
    });
  });
});

ipcMain.handle('check-whisper', async () => {
  return new Promise((resolve) => {
    exec('python -c "import whisper; print(whisper.__version__)"', (error) => {
      resolve(!error);
    });
  });
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  shell.openPath(folderPath);
});

ipcMain.handle('show-in-folder', async (event, filePath) => {
  shell.showItemInFolder(filePath);
});
