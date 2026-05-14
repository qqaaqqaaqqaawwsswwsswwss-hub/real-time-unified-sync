import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTime } from "@/hooks/use-time";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Mode = "focus" | "shortBreak" | "longBreak";

const MODE_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_COLORS = {
  focus: "hsl(var(--primary))",
  shortBreak: "hsl(var(--accent))",
  longBreak: "10 100% 50%", // emerald is not in root, let's use a nice green directly or from vars. Actually let's use a green hex or hsl
};

function formatMinSec(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function Pomodoro() {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [autoStart, setAutoStart] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { toast } = useToast();

  const [history, setHistory] = useState<{ mode: Mode, date: Date }[]>([]);

  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSessionEnd = useCallback(() => {
    playChime();
    setHistory(prev => [...prev, { mode, date: new Date() }]);
    
    let nextMode: Mode = "focus";
    if (mode === "focus") {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      nextMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
      toast({ title: "تم إكمال جلسة التركيز!", description: "حان وقت الاستراحة." });
    } else {
      nextMode = "focus";
      toast({ title: "انتهت الاستراحة", description: "مستعد للتركيز؟" });
    }

    setMode(nextMode);
    setTimeLeft(MODE_DURATIONS[nextMode]);
    
    if (autoStart) {
      endRef.current = Date.now() + MODE_DURATIONS[nextMode] * 1000;
    } else {
      setRunning(false);
      endRef.current = null;
    }
  }, [mode, sessionsCompleted, autoStart, toast, soundEnabled]);

  const tick = useCallback(() => {
    if (endRef.current !== null) {
      const leftMs = endRef.current - Date.now();
      if (leftMs <= 0) {
        setTimeLeft(0);
        handleSessionEnd();
        if (autoStart) {
           rafRef.current = requestAnimationFrame(tick);
        }
        return;
      }
      setTimeLeft(leftMs / 1000);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [handleSessionEnd, autoStart]);

  const toggleTimer = () => {
    if (running) {
      setRunning(false);
      endRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    } else {
      setRunning(true);
      endRef.current = Date.now() + timeLeft * 1000;
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const resetTimer = () => {
    setRunning(false);
    endRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const changeMode = (m: Mode) => {
    setMode(m);
    setRunning(false);
    endRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTimeLeft(MODE_DURATIONS[m]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey) {
        resetTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [running, timeLeft, mode]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const progress = timeLeft / MODE_DURATIONS[mode];
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeColor = mode === "focus" ? "hsl(var(--primary))" : mode === "shortBreak" ? "hsl(var(--accent))" : "hsl(142 71% 45%)"; // emerald

  const dots = [1, 2, 3, 4];
  const filledDots = sessionsCompleted % 4;

  const messages = {
    focus: "حافظ على تركيزك",
    shortBreak: "خذ استراحة قصيرة",
    longBreak: "استرح وجدد طاقتك"
  };

  const [activeTab, setActiveTab] = useState<"timer" | "breathe">("timer");

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto py-8">
      <div className="flex gap-2 justify-center mb-6">
        <Button variant={activeTab === "timer" ? "default" : "outline"} onClick={() => setActiveTab("timer")}>بومودورو</Button>
        <Button variant={activeTab === "breathe" ? "default" : "outline"} onClick={() => setActiveTab("breathe")}>تنفس</Button>
      </div>

      {activeTab === "timer" ? (
      <>
        <div className="flex gap-2 bg-muted/50 p-1 rounded-full mb-8 overflow-x-auto w-full max-w-sm justify-center">
          <Button variant={mode === "focus" ? "default" : "ghost"} className="rounded-full flex-1" onClick={() => changeMode("focus")}>تركيز</Button>
          <Button variant={mode === "shortBreak" ? "default" : "ghost"} className="rounded-full flex-1" onClick={() => changeMode("shortBreak")}>استراحة قصيرة</Button>
          <Button variant={mode === "longBreak" ? "default" : "ghost"} className="rounded-full flex-1" onClick={() => changeMode("longBreak")}>استراحة طويلة</Button>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <svg className="absolute inset-0 -rotate-90 w-[220px] h-[220px] md:w-[280px] md:h-[280px]" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
            <circle
              cx="140" cy="140" r={radius} fill="none"
              stroke={strokeColor} strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: running ? "stroke-dashoffset 0.1s linear" : "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="z-10 flex flex-col items-center w-[220px] h-[220px] md:w-[280px] md:h-[280px] justify-center pt-4">
            <span className="font-mono text-5xl md:text-7xl font-bold tabular-nums tracking-tighter" style={{ textShadow: `0 0 20px ${strokeColor}40` }} dir="ltr">
              {formatMinSec(timeLeft)}
            </span>
            <span className="text-muted-foreground mt-2 text-sm md:text-base font-medium tracking-wide uppercase">{messages[mode]}</span>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          {dots.map(d => (
            <div key={d} className={`w-3 h-3 rounded-full ${d <= (filledDots === 0 && sessionsCompleted > 0 && mode === 'longBreak' ? 4 : filledDots) ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <div className="flex items-center gap-6 mb-8" dir="ltr">
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full hidden sm:flex" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button size="icon" className="w-20 h-20 md:w-24 md:h-24 rounded-full shadow-xl hover:scale-105 transition-transform" style={{ backgroundColor: strokeColor, color: 'hsl(var(--background))' }} onClick={toggleTimer}>
            {running ? <Pause className="w-10 h-10 md:w-12 md:h-12" fill="currentColor" /> : <Play className="w-10 h-10 md:w-12 md:h-12 ml-2" fill="currentColor" />}
          </Button>
          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={resetTimer}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoStart} onChange={e => setAutoStart(e.target.checked)} className="rounded border-border accent-primary" />
            البدء التلقائي للجلسة التالية
          </label>
        </div>

        <div className="text-xs text-muted-foreground/60 hidden sm:block">
          اضغط <kbd className="px-1.5 py-0.5 bg-muted rounded border" dir="ltr">Space</kbd> للتشغيل/الإيقاف، <kbd className="px-1.5 py-0.5 bg-muted rounded border" dir="ltr">R</kbd> لإعادة الضبط
        </div>

        {history.length > 0 && (
          <Card className="w-full mt-12 p-6 glass">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">سجل اليوم</h3>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {history.slice().reverse().map((h, i) => {
                const modeMap = { focus: "تركيز", shortBreak: "استراحة قصيرة", longBreak: "استراحة طويلة" };
                return (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="capitalize">{modeMap[h.mode] || h.mode}</span>
                    <span className="font-mono text-muted-foreground" dir="ltr">{h.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </>
      ) : (
        <BreathingExercise />
      )}
    </div>
  );
}

function BreathingExercise() {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [cycles, setCycles] = useState(0);
  const phaseRef = useRef(phase);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathing = () => {
    setCycles(0);
    nextPhase("inhale");
  };

  const stopBreathing = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPhase("idle");
    phaseRef.current = "idle";
  };

  const nextPhase = (next: "inhale" | "hold" | "exhale") => {
    setPhase(next);
    phaseRef.current = next;

    if (next === "inhale") {
      timeoutRef.current = setTimeout(() => nextPhase("hold"), 4000);
    } else if (next === "hold") {
      timeoutRef.current = setTimeout(() => nextPhase("exhale"), 7000);
    } else if (next === "exhale") {
      timeoutRef.current = setTimeout(() => {
        setCycles(c => c + 1);
        nextPhase("inhale");
      }, 8000);
    }
  };

  useEffect(() => {
    return stopBreathing;
  }, []);

  const scaleMap = {
    idle: 1,
    inhale: 2,
    hold: 2,
    exhale: 1
  };
  const durationMap = {
    idle: 0,
    inhale: 4,
    hold: 7,
    exhale: 8
  };
  const textMap = {
    idle: "اضغط للبدء",
    inhale: "استنشق",
    hold: "احبس",
    exhale: "أخرج"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-lg text-muted-foreground mb-12">تمرين التنفس ٤-٧-٨</div>
      
      <div className="relative flex items-center justify-center w-64 h-64 mb-12">
        <div 
          className="absolute rounded-full bg-primary/20"
          style={{
            width: '100px',
            height: '100px',
            transform: `scale(${scaleMap[phase]})`,
            transition: `transform ${phase === 'idle' ? 0.3 : durationMap[phase]}s linear`
          }}
        />
        <div 
          className="absolute rounded-full bg-primary/40 flex items-center justify-center shadow-lg"
          style={{
            width: '100px',
            height: '100px',
            transform: `scale(${phase === 'idle' ? 1 : 1.2})`,
            transition: `transform 0.5s ease-in-out`
          }}
        >
          <span className="font-bold text-xl text-primary-foreground drop-shadow-md z-10">{textMap[phase]}</span>
        </div>
      </div>

      <div className="text-xl font-mono mb-8">
        الدورات: {cycles}
      </div>

      <div className="flex gap-4">
        {phase === "idle" ? (
          <Button size="lg" onClick={startBreathing}>بدء التمرين</Button>
        ) : (
          <Button size="lg" variant="outline" onClick={stopBreathing}>إيقاف</Button>
        )}
      </div>
    </div>
  );
}
