import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, Upload, Music, Volume2, SkipBack, SkipForward } from "lucide-react";

interface AmbientSound {
  id: string;
  name: string;
  description: string;
  generate: (ctx: AudioContext) => { src: AudioNode, gain: GainNode, filter?: BiquadFilterNode };
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "brown-noise",
    name: "ضوضاء بنية",
    description: "Deep, low-frequency soothing noise",
    generate: (ctx) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; 
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(gain);
      return { src, gain };
    }
  },
  {
    id: "pink-noise",
    name: "ضوضاء وردية",
    description: "Balanced spectral noise",
    generate: (ctx) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; 
        b6 = white * 0.115926;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(gain);
      return { src, gain };
    }
  },
  {
    id: "white-noise",
    name: "ضوضاء بيضاء",
    description: "Flat spectrum random samples",
    generate: (ctx) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(gain);
      return { src, gain };
    }
  },
  {
    id: "rain",
    name: "صوت المطر",
    description: "Filtered brown noise with crackle",
    generate: (ctx) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        if (Math.random() > 0.99) output[i] += Math.random() * 0.5;
        output[i] *= 3.5;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1000;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      src.connect(filter).connect(gain);
      return { src, gain, filter };
    }
  },
  {
    id: "lofi-cafe",
    name: "كافيه لو-فاي",
    description: "Warm, hummy ambient feel",
    generate: (ctx) => {
      const src = ctx.createOscillator();
      src.type = "sine";
      src.frequency.value = 220;
      
      const src2 = ctx.createOscillator();
      src2.type = "sine";
      src2.frequency.value = 330;
      
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.3;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 50;
      lfo.connect(lfoGain);
      lfoGain.connect(src.frequency);
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      
      const merger = ctx.createGain();
      src.connect(merger);
      src2.connect(merger);
      merger.connect(gain);
      
      (src as any).start2 = () => { src.start(); src2.start(); lfo.start(); };
      (src as any).stop2 = () => { src.stop(); src2.stop(); lfo.stop(); };
      
      return { src, gain };
    }
  },
  {
    id: "deep-focus",
    name: "تركيز عميق",
    description: "Very low frequency drone (60Hz + 120Hz)",
    generate: (ctx) => {
      const src = ctx.createOscillator();
      src.type = "sine";
      src.frequency.value = 60;
      
      const src2 = ctx.createOscillator();
      src2.type = "sine";
      src2.frequency.value = 120;
      
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.1;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(src.frequency);
      
      const gain = ctx.createGain();
      gain.gain.value = 0;
      
      const merger = ctx.createGain();
      src.connect(merger);
      src2.connect(merger);
      merger.connect(gain);
      
      (src as any).start2 = () => { src.start(); src2.start(); lfo.start(); };
      (src as any).stop2 = () => { src.stop(); src2.stop(); lfo.stop(); };
      
      return { src, gain };
    }
  }
];

interface PlayingAmbient {
  id: string;
  gainNode: GainNode;
  source: AudioNode;
  volume: number;
}

export function MusicPlayer() {
  // Ambient
  const [playingAmbient, setPlayingAmbient] = useState<Record<string, number>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<Record<string, PlayingAmbient>>({});

  // Local Music
  const [tracks, setTracks] = useState<{name: string, url: string}[]>([]);
  const [currentTrackIdx, setCurrentTrackIdx] = useState<number>(-1);
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [localVolume, setLocalVolume] = useState(50);
  const [localProgress, setLocalProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const toggleAmbient = (sound: AmbientSound) => {
    const ctx = initAudio();
    const isPlaying = playingAmbient[sound.id] !== undefined;

    if (isPlaying) {
      const node = ambientNodesRef.current[sound.id];
      if (node) {
        node.gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        setTimeout(() => {
          if ((node.source as any).stop2) {
             (node.source as any).stop2();
          } else {
             (node.source as any).stop();
          }
          node.source.disconnect();
          delete ambientNodesRef.current[sound.id];
        }, 500);
      }
      const newMap = { ...playingAmbient };
      delete newMap[sound.id];
      setPlayingAmbient(newMap);
    } else {
      const { src, gain } = sound.generate(ctx);
      gain.connect(ctx.destination);
      
      if ((src as any).start2) {
        (src as any).start2();
      } else {
        (src as any).start();
      }
      
      const vol = 50;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol / 100, ctx.currentTime + 1);
      
      ambientNodesRef.current[sound.id] = { id: sound.id, gainNode: gain, source: src, volume: vol };
      setPlayingAmbient(prev => ({ ...prev, [sound.id]: vol }));
    }
  };

  const setAmbientVolume = (id: string, vol: number) => {
    setPlayingAmbient(prev => ({ ...prev, [id]: vol }));
    const node = ambientNodesRef.current[id];
    if (node && audioCtxRef.current) {
      node.volume = vol;
      node.gainNode.gain.linearRampToValueAtTime(vol / 100, audioCtxRef.current.currentTime + 0.1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newTracks = Array.from(files).map(file => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file)
    }));
    
    setTracks(prev => [...prev, ...newTracks]);
    if (currentTrackIdx === -1 && newTracks.length > 0) {
      setCurrentTrackIdx(0);
      setIsPlayingLocal(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingLocal) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingLocal, currentTrackIdx]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = localVolume / 100;
    }
  }, [localVolume]);

  const toggleLocalPlay = () => {
    if (tracks.length === 0) return;
    setIsPlayingLocal(!isPlayingLocal);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIdx((prev) => (prev + 1) % tracks.length);
    setIsPlayingLocal(true);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIdx((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlayingLocal(true);
  };

  const isAnyPlaying = Object.keys(playingAmbient).length > 0 || isPlayingLocal;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 pb-24" data-testid="section-music">
      
      {/* Ambient Sounds */}
      <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Volume2 className="w-6 h-6 text-primary" /> أصوات التركيز</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AMBIENT_SOUNDS.map(sound => {
            const isPlaying = playingAmbient[sound.id] !== undefined;
            const vol = playingAmbient[sound.id] || 50;
            return (
              <Card key={sound.id} className={`p-4 transition-all duration-300 ${isPlaying ? 'glass border-primary/30 shadow-lg shadow-primary/5' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold">{sound.name}</h3>
                    <p className="text-xs text-muted-foreground">{sound.description}</p>
                  </div>
                  <Button size="icon" variant={isPlaying ? "default" : "secondary"} className="rounded-full w-10 h-10 shrink-0" onClick={() => toggleAmbient(sound)}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
                {isPlaying && (
                  <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Slider
                      value={[vol]}
                      max={100}
                      step={1}
                      onValueChange={(vals) => setAmbientVolume(sound.id, vals[0])}
                      className="flex-1"
                    />
                    <div className="flex gap-0.5 h-4 items-end ml-2 shrink-0">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-1 bg-primary rounded-t-sm animate-pulse" style={{ height: `${Math.max(20, Math.random() * 100)}%`, animationDuration: `${0.5 + Math.random()}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Local Player */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Music className="w-6 h-6 text-primary" /> مشغّل الملفات</h2>
          <div>
            <Label htmlFor="music-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" /> رفع موسيقى
              </div>
            </Label>
            <input id="music-upload" type="file" accept="audio/*" multiple className="hidden" onChange={handleFileUpload} />
          </div>
        </div>

        {tracks.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed">
            <Music className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">لا توجد موسيقى</h3>
            <p className="text-sm">ارفع ملفات صوتية للاستماع أثناء العمل.</p>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden glass border-primary/20">
            <div className="p-6 border-b border-border/10 bg-muted/20">
              <div className="w-full overflow-hidden mb-4 h-8 relative" dir="ltr">
                <div className={`whitespace-nowrap font-bold text-lg ${tracks[currentTrackIdx]?.name.length > 30 ? 'animate-marquee' : ''}`}>
                  {tracks[currentTrackIdx]?.name || "Select a track"}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-4" dir="ltr">
                <Button size="icon" variant="ghost" onClick={prevTrack}><SkipBack className="w-5 h-5" /></Button>
                <Button size="icon" className="w-14 h-14 rounded-full" onClick={toggleLocalPlay}>
                  {isPlayingLocal ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={nextTrack}><SkipForward className="w-5 h-5" /></Button>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[localVolume]}
                  max={100}
                  step={1}
                  onValueChange={(vals) => setLocalVolume(vals[0])}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto p-2" dir="ltr">
              {tracks.map((track, idx) => (
                <div 
                  key={idx} 
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer rounded-md transition-colors ${idx === currentTrackIdx ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'}`}
                  onClick={() => {
                    setCurrentTrackIdx(idx);
                    setIsPlayingLocal(true);
                  }}
                >
                  <div className="w-4 flex justify-center text-xs opacity-50">{idx === currentTrackIdx && isPlayingLocal ? <Music className="w-3 h-3 animate-pulse" /> : idx + 1}</div>
                  <div className="truncate flex-1 text-sm">{track.name}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Hidden Audio Element */}
      {tracks[currentTrackIdx] && (
        <audio
          ref={audioRef}
          src={tracks[currentTrackIdx].url}
          onEnded={nextTrack}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            setLocalProgress((el.currentTime / el.duration) * 100 || 0);
          }}
        />
      )}

      {/* Mini Player Bottom Bar */}
      {isAnyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary/20 p-3 px-6 animate-in slide-in-from-bottom flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="truncate pl-4">
              <div className="text-sm font-bold truncate">
                {isPlayingLocal && tracks[currentTrackIdx] ? tracks[currentTrackIdx].name : "أصوات التركيز"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {Object.keys(playingAmbient).length > 0 && "يُشغَّل: " + Object.keys(playingAmbient).map(id => AMBIENT_SOUNDS.find(s => s.id === id)?.name).join('، ')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0" dir="ltr">
            {tracks.length > 0 && (
              <Button size="icon" variant="ghost" onClick={toggleLocalPlay} className="rounded-full">
                {isPlayingLocal ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
