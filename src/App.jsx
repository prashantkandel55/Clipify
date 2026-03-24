import React, { useState, useEffect } from 'react'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200)
    return () => clearTimeout(t)
  }, [])

  if (!ready) {
    return (
      <div style={{
        width:'100vw', height:'100vh', background:'#0f0f13',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:'12px'
      }}>
        <div style={{fontSize:'36px',fontWeight:'800',color:'#fff',letterSpacing:'-1px'}}>
          Clip<span style={{color:'#534AB7'}}>ify</span>
        </div>
        <div style={{width:'100px',height:'3px',background:'#1e1e2a',borderRadius:'2px'}}>
          <div style={{
            height:'3px', background:'#534AB7', borderRadius:'2px',
            animation:'bar 1.1s ease forwards'
          }}/>
        </div>
        <style>{`@keyframes bar{from{width:0}to{width:100%}}`}</style>
      </div>
    )
  }

  return <MainLayout />
}

function MainLayout() {
  const [clips, setClips] = useState([])
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('captions')
  const [videoPath, setVideoPath] = useState(null)
  const [youTubeUrl, setYouTubeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState(null)

  const handleImport = async () => {
    if (window.clipify?.openFile) {
      const path = await window.clipify.openFile()
      if (path) {
        setVideoPath(path)
        setClips([])
        setSelected(null)
        console.log('File loaded:', path)
      }
    }
  }

  const handleAnalyze = async () => {
    if (!videoPath) return
    
    setIsLoading(true)
    setError(null)
    setLoadingMessage('Transcribing audio...')
    
    try {
      // Transcribe
      const result = await window.clipify.transcribe(videoPath)
      console.log('Transcription result:', result)
      
      setLoadingMessage('Detecting clips...')
      
      // Detect clips
      const clipResult = await window.clipify.detectClips({ segments: result.segments || [] })
      console.log('Clip detection result:', clipResult)
      console.log('Clips length:', clipResult?.length)
      
      if (clipResult && clipResult.length > 0) {
        setClips(clipResult)
        setSelected(clipResult[0])
        console.log('Clips set successfully')
      } else {
        setClips([])
        setSelected(null)
        setError('No clips detected. Try a longer video.')
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.message || 'Failed to analyze video. Make sure Whisper is installed: pip install openai-whisper')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const handleExport = async () => {
    if (clips.length === 0 || !selected) {
      setError('No clip selected to export')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setLoadingMessage('Exporting clip...')
    
    try {
      const outputDir = await window.clipify.selectOutputDir()
      if (!outputDir) {
        setIsLoading(false)
        setLoadingMessage('')
        return
      }
      
      const outputName = `clip_${selected.start}_${selected.duration}s.mp4`
      const outputPath = `${outputDir}/${outputName}`
      
      await window.clipify.exportClip({
        inputPath: videoPath,
        outputPath,
        startTime: selected.start,
        duration: selected.duration,
        captions: [],
        captionStyle: 'word',
        fontSize: 20,
        captionColor: '#FFFFFF',
        highlightColor: '#534AB7',
        captionPosition: 'bottom',
        backgroundFill: 'blur',
      })
      
      setLoadingMessage('Opening folder...')
      await window.clipify.openFolder(outputDir)
      setError(null)
    } catch (err) {
      console.error('Export error:', err)
      setError(err.message || 'Failed to export clip. Make sure FFmpeg is installed and in PATH.')
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.path) {
      setVideoPath(file.path)
      console.log('File dropped:', file.path)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleYouTubeImport = async () => {
    if (youTubeUrl.trim() && window.clipify?.downloadYoutube) {
      setIsLoading(true)
      setError(null)
      setLoadingMessage('Downloading from YouTube...')
      
      try {
        console.log('Downloading from YouTube:', youTubeUrl)
        const result = await window.clipify.downloadYoutube(youTubeUrl)
        if (result) {
          setVideoPath(result)
          setYouTubeUrl('')
          console.log('YouTube video downloaded:', result)
        }
      } catch (error) {
        console.error('Error downloading YouTube video:', error)
        setError(error.message || 'Failed to download YouTube video. Make sure Node.js and yt-dlp are installed: npm install -g yt-dlp')
      } finally {
        setIsLoading(false)
        setLoadingMessage('')
      }
    } else if (!youTubeUrl.trim()) {
      setError('Please enter a YouTube URL')
    }
  }

  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'260px 1fr 300px',
      gridTemplateRows:'48px 1fr 150px 34px',
      width:'100vw', height:'100vh',
      background:'#0f0f13', color:'#e8e8f0',
      fontFamily:'Inter, system-ui, sans-serif',
      overflow:'hidden', userSelect:'none'
    }}>

      {/* TOP BAR */}
      <div style={{
        gridColumn:'1/-1', background:'#16161e',
        borderBottom:'1px solid #2a2a3a',
        display:'flex', alignItems:'center', padding:'0 16px', gap:'12px'
      }}>
        <div style={{fontSize:'18px',fontWeight:'800',letterSpacing:'-0.5px'}}>
          Clip<span style={{color:'#534AB7'}}>ify</span>
        </div>
        <div style={{
          fontSize:'12px', color:'#555', marginLeft:'8px',
          borderLeft:'1px solid #2a2a3a', paddingLeft:'12px'
        }}>
          {videoPath ? videoPath.split('\\').pop() : 'No file loaded'}
        </div>
        <div style={{flex:1}}/>
        <button onClick={handleImport} style={{
          padding:'7px 16px', background:'transparent',
          border:'1px solid #534AB7', borderRadius:'6px',
          color:'#7F77DD', fontSize:'13px', cursor:'pointer'
        }}>Import File</button>
        {videoPath && !isLoading && (
          <button onClick={handleAnalyze} style={{
            padding:'7px 16px', background:'#534AB7',
            border:'none', borderRadius:'6px',
            color:'white', fontSize:'13px', cursor:'pointer'
          }}>Analyze</button>
        )}
        {clips.length > 0 && (
          <button onClick={handleExport} style={{
            padding:'7px 16px', background:'#22c55e',
            border:'none', borderRadius:'6px',
            color:'white', fontSize:'13px', cursor:'pointer'
          }}>Export Selected</button>
        )}
      </div>

      {/* LOADING BAR */}
      {isLoading && (
        <div style={{
          gridColumn:'1/-1', background:'#1e1e3a',
          borderBottom:'1px solid #534AB7',
          padding:'8px 16px', display:'flex', alignItems:'center', gap:'12px'
        }}>
          <div style={{
            width:'16px', height:'16px', border:'2px solid #534AB7',
            borderTopColor:'transparent', borderRadius:'50%',
            animation:'spin 0.8s linear infinite'
          }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{fontSize:'13px', color:'#e8e8f0'}}>{loadingMessage}</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{
          gridColumn:'1/-1', background:'#3a1e1e',
          borderBottom:'1px solid #ef4444',
          padding:'8px 16px', display:'flex', alignItems:'center', gap:'12px'
        }}>
          <span style={{fontSize:'13px', color:'#f87171'}}>Error: {error}</span>
          <button onClick={() => setError(null)} style={{
            marginLeft:'auto', padding:'4px 8px', background:'transparent',
            border:'1px solid #ef4444', borderRadius:'4px',
            color:'#ef4444', fontSize:'12px', cursor:'pointer'
          }}>Dismiss</button>
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{
        background:'#16161e', borderRight:'1px solid #2a2a3a',
        display:'flex', flexDirection:'column', overflow:'hidden'
      }}>
        <div style={{
          padding:'12px 14px 8px',
          fontSize:'10px', fontWeight:'600',
          color:'#555', letterSpacing:'1px'
        }}>CLIPS</div>

        <div style={{flex:1, overflowY:'auto', padding:'0 10px'}}>
          {clips.length === 0 ? (
            <div
              onClick={handleImport}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                margin:'8px 0', padding:'24px 12px',
                border:'1px dashed #2a2a3a', borderRadius:'8px',
                textAlign:'center', cursor:'pointer', color:'#555',
                fontSize:'12px', lineHeight:'1.6'
              }}
            >
              <div style={{fontSize:'24px', marginBottom:'8px', opacity:0.4}}>🎬</div>
              Drop video here<br/>or click to browse
            </div>
          ) : clips.map((c, i) => (
            <div key={i} onClick={() => setSelected(c)}
              style={{
                padding:'10px', marginBottom:'6px', borderRadius:'8px',
                background: selected===c ? '#1e1e3a' : '#1e1e2a',
                border: selected===c ? '1px solid #534AB7' : '1px solid #2a2a3a',
                cursor:'pointer'
              }}>
              <div style={{fontSize:'12px', fontWeight:'500', marginBottom:'3px'}}>
                {c.title}
              </div>
              <div style={{fontSize:'11px', color:'#666'}}>
                {c.start}s → {c.end}s · {c.duration}s
              </div>
              <div style={{
                display:'inline-block', marginTop:'5px',
                padding:'2px 7px', borderRadius:'10px', fontSize:'10px',
                background: c.score >= 80 ? '#1a3a1a' : c.score >= 60 ? '#3a3a1a' : '#3a1a1a',
                color: c.score >= 80 ? '#4ade80' : c.score >= 60 ? '#facc15' : '#f87171'
              }}>
                Score: {c.score}
              </div>
            </div>
          ))}
        </div>

        <div style={{padding:'12px'}}>
          <input
            placeholder="Paste YouTube URL..."
            value={youTubeUrl}
            onChange={(e) => setYouTubeUrl(e.target.value)}
            style={{
              width:'100%', padding:'7px 10px', marginBottom:'8px',
              background:'#1e1e2a', border:'1px solid #2a2a3a',
              borderRadius:'6px', color:'#e8e8f0', fontSize:'12px',
              boxSizing:'border-box'
            }}
          />
          <button 
            onClick={handleYouTubeImport}
            style={{
              width:'100%', padding:'9px',
              background: youTubeUrl.trim() ? '#534AB7' : '#1e1e2a',
              border:'1px solid #2a2a3a',
              borderRadius:'6px', 
              color: youTubeUrl.trim() ? 'white' : '#aaa', 
              fontSize:'13px', 
              cursor: youTubeUrl.trim() ? 'pointer' : 'not-allowed'
            }}
          >Import from YouTube</button>
        </div>
      </div>

      {/* VIDEO PREVIEW */}
      <div style={{
        background:'#0a0a0f',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        position:'relative'
      }}>
        {videoPath ? (
          <video
            src={`file://${videoPath}`}
            controls
            style={{maxWidth:'100%', maxHeight:'100%'}}
          />
        ) : (
          <div style={{textAlign:'center', color:'#333'}}>
            <div style={{fontSize:'40px', marginBottom:'12px', opacity:0.3}}>🎬</div>
            <div style={{fontSize:'14px'}}>Import a video to get started</div>
          </div>
        )}
        <div style={{
          position:'absolute', top:'10px', right:'10px',
          fontSize:'10px', padding:'3px 8px', borderRadius:'10px',
          background:'rgba(83,74,183,0.3)', color:'#7F77DD'
        }}>9:16 Shorts</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        background:'#16161e', borderLeft:'1px solid #2a2a3a',
        display:'flex', flexDirection:'column', overflow:'hidden'
      }}>
        <div style={{display:'flex', borderBottom:'1px solid #2a2a3a'}}>
          {['captions','clip','style','ai'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              flex:1, textAlign:'center', padding:'12px 4px',
              fontSize:'11px', cursor:'pointer', textTransform:'capitalize',
              color: tab===t ? '#7F77DD' : '#555',
              borderBottom: tab===t ? '2px solid #534AB7' : '2px solid transparent'
            }}>{t === 'ai' ? 'AI Insights' : t}</div>
          ))}
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'14px'}}>
          {tab === 'captions' && (
            <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'6px'}}>Caption style</div>
                <div style={{display:'flex', border:'1px solid #2a2a3a', borderRadius:'6px', overflow:'hidden'}}>
                  {['Word','Line','Block'].map(s => (
                    <div key={s} style={{
                      flex:1, textAlign:'center', padding:'6px',
                      fontSize:'11px', cursor:'pointer', background:'#1e1e2a', color:'#888'
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'6px'}}>Font size</div>
                <input type="range" min="12" max="36" defaultValue="20" style={{width:'100%'}}/>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'6px'}}>Position</div>
                <div style={{display:'flex', border:'1px solid #2a2a3a', borderRadius:'6px', overflow:'hidden'}}>
                  {['Top','Middle','Bottom'].map(s => (
                    <div key={s} style={{
                      flex:1, textAlign:'center', padding:'6px',
                      fontSize:'11px', cursor:'pointer', background:'#1e1e2a', color:'#888'
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'6px'}}>Highlight color</div>
                <div style={{display:'flex', gap:'8px'}}>
                  {['#534AB7','#E24B4A','#1D9E75','#EF9F27','#D4537E','#ffffff'].map(c => (
                    <div key={c} style={{
                      width:'22px', height:'22px', borderRadius:'50%',
                      background:c, cursor:'pointer',
                      border: c==='#534AB7' ? '2px solid white' : '2px solid transparent'
                    }}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === 'clip' && (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Clip name</div>
                <input style={{
                  width:'100%', padding:'7px', background:'#1e1e2a',
                  border:'1px solid #2a2a3a', borderRadius:'6px',
                  color:'#e8e8f0', fontSize:'12px', boxSizing:'border-box'
                }} placeholder="Clip name..." defaultValue={selected?.title || ''}/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <div>
                  <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Start</div>
                  <input style={{
                    width:'100%', padding:'7px', background:'#1e1e2a',
                    border:'1px solid #2a2a3a', borderRadius:'6px',
                    color:'#e8e8f0', fontSize:'12px', boxSizing:'border-box'
                  }} defaultValue={selected?.start || '0'}/>
                </div>
                <div>
                  <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>End</div>
                  <input style={{
                    width:'100%', padding:'7px', background:'#1e1e2a',
                    border:'1px solid #2a2a3a', borderRadius:'6px',
                    color:'#e8e8f0', fontSize:'12px', boxSizing:'border-box'
                  }} defaultValue={selected?.end || '0'}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Platform</div>
                <div style={{display:'flex', gap:'6px'}}>
                  {['TikTok','Reels','Shorts'].map(p => (
                    <div key={p} style={{
                      flex:1, textAlign:'center', padding:'6px 4px',
                      background:'#1e1e2a', border:'1px solid #2a2a3a',
                      borderRadius:'6px', fontSize:'11px',
                      cursor:'pointer', color:'#888'
                    }}>{p}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Speed</div>
                <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" style={{width:'100%'}}/>
              </div>
            </div>
          )}
          {tab === 'style' && (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Background</div>
                <select style={{
                  width:'100%', padding:'7px', background:'#1e1e2a',
                  border:'1px solid #2a2a3a', borderRadius:'6px',
                  color:'#e8e8f0', fontSize:'12px'
                }}>
                  <option>Blur</option>
                  <option>Solid Color</option>
                  <option>Gradient</option>
                </select>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Logo</div>
                <button style={{
                  width:'100%', padding:'7px', background:'#1e1e2a',
                  border:'1px solid #2a2a3a', borderRadius:'6px',
                  color:'#888', fontSize:'12px', cursor:'pointer'
                }}>Upload Logo</button>
              </div>
              <div>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'5px'}}>Intro/Outro</div>
                <div style={{display:'flex', gap:'8px'}}>
                  <button style={{
                    flex:1, padding:'6px', background:'#1e1e2a',
                    border:'1px solid #2a2a3a', borderRadius:'6px',
                    color:'#888', fontSize:'11px', cursor:'pointer'
                  }}>Add Intro</button>
                  <button style={{
                    flex:1, padding:'6px', background:'#1e1e2a',
                    border:'1px solid #2a2a3a', borderRadius:'6px',
                    color:'#888', fontSize:'11px', cursor:'pointer'
                  }}>Add Outro</button>
                </div>
              </div>
            </div>
          )}
          {tab === 'ai' && (
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <div style={{
                padding:'10px', background:'#1e1e2a',
                borderRadius:'8px', border:'1px solid #2a2a3a'
              }}>
                <div style={{fontSize:'11px', color:'#555', marginBottom:'4px'}}>AI Suggestions</div>
                <div style={{fontSize:'12px', color:'#888', lineHeight:'1.5'}}>
                  Analyze your video for viral moments and trending topics.
                </div>
              </div>
              <button style={{
                padding:'9px', background:'#534AB7', border:'none',
                borderRadius:'6px', color:'white', fontSize:'12px',
                cursor:'pointer'
              }}>Run AI Analysis</button>
            </div>
          )}
        </div>
      </div>

      {/* TIMELINE */}
      <div style={{
        gridColumn:'1/-1', background:'#16161e',
        borderTop:'1px solid #2a2a3a', padding:'12px 16px'
      }}>
        <div style={{fontSize:'11px', color:'#555', marginBottom:'8px'}}>Timeline</div>
        <div style={{
          height:'32px', background:'#1e1e2a', borderRadius:'6px',
          position:'relative', overflow:'hidden'
        }}>
          <div style={{
            position:'absolute', left:'30%', width:'20%', height:'100%',
            background:'rgba(83,74,183,0.3)', border:'1px solid #534AB7'
          }}/>
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={{
        gridColumn:'1/-1', background:'#0f0f13',
        borderTop:'1px solid #2a2a3a',
        display:'flex', alignItems:'center', padding:'0 12px',
        fontSize:'11px', color:'#555'
      }}>
        <div>Ready</div>
        <div style={{flex:1}}/>
        <div>FFmpeg ✓</div>
        <div style={{marginLeft:'12px'}}>Whisper ✓</div>
      </div>
    </div>
  )
}
