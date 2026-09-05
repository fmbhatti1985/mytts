"use client";
import { useState, useRef, useEffect } from 'react';
import { VOICES, LANGUAGES } from '@/lib/voices';
import { Play, Pause, Download, Settings, Volume2, Type, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

function AdSlot({ type }: { type: 'horizontal' | 'rectangle' }) {
  return (
    <div className={`flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-lg relative overflow-hidden ${
      type === 'horizontal' ? 'w-full h-[90px] md:h-[120px] my-4' : 'w-full h-[250px] mt-6'
    }`}>
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] uppercase rounded-sm font-semibold tracking-wider">
        Advertisement
      </div>
      <div className="text-slate-400 text-sm text-center px-4 mt-4">
        {type === 'horizontal' ? 'Responsive Leaderboard (728x90)' : 'Medium Rectangle (300x250)'}
        <br />
        <span className="text-xs opacity-70">Paste your AdSense / Monetag code here</span>
      </div>
    </div>
  );
}

export default function TTSPage() {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('English (US)');
  const [voice, setVoice] = useState('en-US-AriaNeural');
  
  const [rate, setRate] = useState(0); 
  const [pitch, setPitch] = useState(0); 
  const [volume, setVolume] = useState(100); 
  
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const availableVoices = VOICES.filter(v => v.language === lang);
  
  useEffect(() => {
    if (!availableVoices.find(v => v.name === voice)) {
      setVoice(availableVoices[0]?.name || '');
    }
  }, [lang]);

  const handleGenerate = async (isPreview = false) => {
    const textToGenerate = isPreview ? "Hello! This is a preview of this voice." : text;
    if (!textToGenerate.trim()) {
      setError("Please enter some text to synthesize.");
      return;
    }
    
    if (isPreview) setPreviewLoading(true);
    else setLoading(true);
    
    setError(null);
    if (!isPreview) setSuccess(false);
    
    try {
      const formatRate = rate === 0 ? 'default' : (rate > 0 ? `+${rate}%` : `${rate}%`);
      const formatPitch = pitch === 0 ? 'default' : (pitch > 0 ? `+${pitch}Hz` : `${pitch}Hz`);
      const formatVol = volume === 100 ? 'default' : `${volume - 100}%`;
      
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToGenerate,
          voice,
          lang,
          rate: formatRate,
          pitch: formatPitch,
          volume: formatVol,
          saveSubtitles: true
        })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || "Generation failed");
      }
      
      setAudioUrl(data.audio.url);
      setSubtitleUrl(data.subtitles?.available ? data.subtitles.url : null);
      
      if (!isPreview) {
        setSuccess(true);
      } else {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error(e));
          }
        }, 100);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPreviewLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
    } catch (e) {
      alert("Failed to paste from clipboard");
    }
  };
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Volume2 className="text-blue-600 h-6 w-6" />
          <h1 className="text-xl font-semibold">AI Text-to-Speech</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        
        <div className="lg:col-span-3">
          <AdSlot type="horizontal" />
        </div>

        {/* LEFT COLUMN: TEXT EDITOR & OUTPUT */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 flex justify-between items-center">
              <h2 className="font-medium text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4" /> Text Editor
              </h2>
              <div className="flex gap-2 text-sm">
                <button onClick={() => setText('')} className="text-gray-500 hover:text-gray-800 transition-colors">Clear</button>
                <span className="text-gray-300">|</span>
                <button onClick={handlePaste} className="text-blue-600 hover:text-blue-700 transition-colors">Paste</button>
              </div>
            </div>
            
            <div className="p-4 flex-grow">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={5000}
                placeholder="Type or paste the text you want to convert to speech..."
                className="w-full h-64 resize-none outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <div>{text.length.toLocaleString()} / 5,000 characters</div>
              <div>{text.trim() === '' ? 0 : text.trim().split(/\s+/).length} words</div>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* SUCCESS OUTPUT */}
          {success && audioUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-100 bg-green-50/50 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h2 className="font-medium text-green-800">Speech Generated</h2>
              </div>
              <div className="p-6">
                <audio 
                  ref={audioRef} 
                  src={audioUrl} 
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="hidden" 
                />
                
                <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={togglePlay}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                  </button>
                  
                  <div className="flex-grow flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div 
                      className="h-2 bg-gray-100 rounded-full overflow-hidden relative cursor-pointer"
                      onClick={(e) => {
                        if (!audioRef.current) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = pos * duration;
                      }}
                    >
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a 
                    href={audioUrl} 
                    download={`tts-output-${Date.now()}.mp3`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    Download MP3
                  </a>
                  
                  {subtitleUrl && (
                    <a 
                      href={subtitleUrl} 
                      download={`tts-subtitles-${Date.now()}.json`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      Subtitles (JSON)
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SETTINGS */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-medium text-gray-800 flex items-center gap-2 mb-5">
              <Settings className="w-4 h-4" /> Voice Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voice</label>
                <select 
                  value={voice} 
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  {availableVoices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.shortName} ({v.gender})
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={() => handleGenerate(true)}
                disabled={previewLoading || loading}
                className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex justify-center items-center gap-2"
              >
                {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin text-gray-500" /> : <Play className="w-4 h-4 text-gray-500" />}
                Preview Voice
              </button>
            </div>
            
            <hr className="my-6 border-gray-100" />
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <label className="font-medium text-gray-700">Rate</label>
                  <span className="text-gray-500">{rate > 0 ? `+${rate}` : rate}%</span>
                </div>
                <input 
                  type="range" min="-50" max="100" step="5"
                  value={rate} onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <label className="font-medium text-gray-700">Pitch</label>
                  <span className="text-gray-500">{pitch > 0 ? `+${pitch}` : pitch}Hz</span>
                </div>
                <input 
                  type="range" min="-50" max="50" step="5"
                  value={pitch} onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>Lower</span>
                  <span>Default</span>
                  <span>Higher</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <label className="font-medium text-gray-700">Volume</label>
                  <span className="text-gray-500">{volume}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => handleGenerate(false)}
            disabled={loading || text.trim() === ''}
            className={`w-full py-3.5 rounded-xl text-white font-medium shadow-sm transition-all flex justify-center items-center gap-2 ${
              loading || text.trim() === '' 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Speech...
              </>
            ) : (
              'Generate Speech'
            )}
          </button>
          
          <AdSlot type="rectangle" />

        </div>
        
        <div className="lg:col-span-3">
          <AdSlot type="horizontal" />
        </div>

      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-sm text-gray-500">
           <p>© {new Date().getFullYear()} AI Text-to-Speech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

