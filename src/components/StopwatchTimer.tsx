import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

function formatMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

function formatTimerMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (startRef.current !== null) {
      setElapsed(baseRef.current + (performance.now() - startRef.current));
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const start = () => {
    startRef.current = performance.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (startRef.current !== null) {
      baseRef.current += performance.now() - startRef.current;
      startRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    baseRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setRunning(false);
  };

  const lap = () => {
    setLaps((prev) => [...prev, elapsed]);
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const lastLapTime = laps.length > 0 ? laps[laps.length - 1] : 0;
  const currentLapElapsed = elapsed - lastLapTime;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="font-mono text-[clamp(3rem,12vw,6rem)] md:text-8xl font-bold tabular-nums tracking-tighter text-foreground glow-text-primary">
        {formatMs(elapsed)}
      </div>
      {laps.length > 0 && (
        <div className="text-muted-foreground font-mono text-xl">
          Lap: {formatMs(currentLapElapsed)}
        </div>
      )}
      <div className="flex gap-3 flex-wrap justify-center w-full max-w-sm">
        {!running ? (
          <Button onClick={start} className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" data-testid="btn-stopwatch-start">
            {elapsed === 0 ? "بدء" : "استئناف"}
          </Button>
        ) : (
          <Button onClick={stop} variant="secondary" className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" data-testid="btn-stopwatch-stop">
            إيقاف
          </Button>
        )}
        <Button onClick={lap} variant="outline" disabled={!running} className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" data-testid="btn-stopwatch-lap">
          لفة
        </Button>
        <Button onClick={reset} variant="outline" className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" data-testid="btn-stopwatch-reset">
          إعادة
        </Button>
      </div>
      {laps.length > 0 && (
        <div className="w-full max-w-sm space-y-2 max-h-48 overflow-y-auto pr-2">
          {laps.slice().reverse().map((lapTime, i) => {
            const lapNum = laps.length - i;
            const prev = lapNum > 1 ? laps[lapNum - 2] : 0;
            return (
              <div
                key={lapNum}
                className="flex justify-between items-center px-4 py-2 rounded-lg bg-card border font-mono text-sm"
                data-testid={`row-lap-${lapNum}`}
              >
                <span className="text-muted-foreground">لفة {lapNum}</span>
                <span dir="ltr">{formatMs(lapTime - prev)}</span>
                <span className="text-muted-foreground" dir="ltr">{formatMs(lapTime)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CountdownTimer() {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const totalMs =
    (parseInt(hours) || 0) * 3600000 +
    (parseInt(minutes) || 0) * 60000 +
    (parseInt(seconds) || 0) * 1000;

  const tick = useCallback(() => {
    if (endRef.current !== null) {
      const left = endRef.current - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        setFinished(true);
        endRef.current = null;
        return;
      }
      setRemaining(left);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const start = () => {
    const ms = remaining !== null ? remaining : totalMs;
    if (ms <= 0) return;
    setFinished(false);
    endRef.current = Date.now() + ms;
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setRunning(false);
    endRef.current = null;
  };

  const reset = () => {
    stop();
    setRemaining(null);
    setFinished(false);
    setRunning(false);
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const displayMs = remaining !== null ? remaining : totalMs;
  const progress = totalMs > 0 ? Math.max(0, Math.min(1, displayMs / totalMs)) : 0;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-[180px] h-[180px] md:w-[220px] md:h-[220px]">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" width="100%" height="100%">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <span className={`font-mono text-[clamp(2rem,8vw,3rem)] font-bold tabular-nums z-10 glow-text-primary ${finished ? "text-destructive animate-pulse" : ""}`} dir="ltr">
          {formatTimerMs(displayMs)}
        </span>
      </div>

      {finished && (
        <div className="text-destructive font-semibold text-lg animate-pulse" data-testid="text-timer-finished">
          انتهى الوقت!
        </div>
      )}

      {!running && remaining === null && (
        <div className="flex gap-3 items-end" dir="ltr">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground text-center">HH</Label>
            <Input
              className="w-14 sm:w-16 h-12 text-center font-mono text-lg"
              value={hours}
              onChange={(e) => setHours(e.target.value.replace(/\D/g, "").slice(0, 2))}
              data-testid="input-timer-hours"
              inputMode="numeric"
            />
          </div>
          <span className="text-2xl font-bold mb-2">:</span>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground text-center">MM</Label>
            <Input
              className="w-14 sm:w-16 h-12 text-center font-mono text-lg"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/\D/g, "").slice(0, 2))}
              data-testid="input-timer-minutes"
              inputMode="numeric"
            />
          </div>
          <span className="text-2xl font-bold mb-2">:</span>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground text-center">SS</Label>
            <Input
              className="w-14 sm:w-16 h-12 text-center font-mono text-lg"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value.replace(/\D/g, "").slice(0, 2))}
              data-testid="input-timer-seconds"
              inputMode="numeric"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap justify-center w-full max-w-sm">
        {!running ? (
          <Button onClick={start} className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" disabled={totalMs === 0 && remaining === null} data-testid="btn-timer-start">
            {remaining !== null ? "استئناف" : "بدء"}
          </Button>
        ) : (
          <Button onClick={stop} variant="secondary" className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" data-testid="btn-timer-stop">
            إيقاف مؤقت
          </Button>
        )}
        <Button onClick={reset} variant="outline" className="min-w-[100px] h-12 flex-1 sm:flex-none text-base" data-testid="btn-timer-reset">
          إعادة
        </Button>
      </div>
    </div>
  );
}

export function StopwatchTimer() {
  const [tab, setTab] = useState<"stopwatch" | "timer">("stopwatch");

  return (
    <section className="flex flex-col gap-6" data-testid="section-tools">
      <div className="flex gap-2 justify-center">
        <Button
          variant={tab === "stopwatch" ? "default" : "outline"}
          onClick={() => setTab("stopwatch")}
          data-testid="btn-tab-stopwatch"
        >
          ساعة الإيقاف
        </Button>
        <Button
          variant={tab === "timer" ? "default" : "outline"}
          onClick={() => setTab("timer")}
          data-testid="btn-tab-timer"
        >
          المؤقت التنازلي
        </Button>
      </div>
      <Card className="p-8">
        {tab === "stopwatch" ? <Stopwatch /> : <CountdownTimer />}
      </Card>
    </section>
  );
}
