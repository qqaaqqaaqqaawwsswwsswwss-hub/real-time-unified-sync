import { useState, useEffect, useRef, useCallback } from "react";
import { useTime } from "@/hooks/use-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, BellRing, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Days = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const DAYS: Days[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

interface Alarm {
  id: string;
  time: string; // HH:MM in 24h format
  label: string;
  days: Days[]; // empty means 'Once'
  sound: string;
  enabled: boolean;
  snoozedUntil?: number; // timestamp
}

const SOUNDS = ["Classic Beep", "Gentle Rise", "Digital", "Chime", "Silent"];

function playAlarmSound(type: string, ctx: AudioContext): () => void {
  if (type === "Silent") return () => {};
  
  let stopFns: (() => void)[] = [];
  const stopAll = () => stopFns.forEach(fn => fn());

  try {
    if (type === "Classic Beep") {
      const interval = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, 500);
      stopFns.push(() => clearInterval(interval));
    } else if (type === "Gentle Rise") {
      const interval = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 3);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.5);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3);
      }, 4000);
      stopFns.push(() => clearInterval(interval));
    } else if (type === "Digital") {
       const interval = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, 400);
      stopFns.push(() => clearInterval(interval));
    } else if (type === "Chime") {
      const interval = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 523.25;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2);
      }, 2500);
      stopFns.push(() => clearInterval(interval));
    }
  } catch(e) {
    console.error("Audio error:", e);
  }

  return stopAll;
}

export function AlarmClock() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem("ultimate-clock-alarms");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTime, setNewTime] = useState("07:00");
  const [newLabel, setNewLabel] = useState("Alarm");
  const [newDays, setNewDays] = useState<Days[]>([]);
  const [newSound, setNewSound] = useState("Classic Beep");

  const [firingAlarm, setFiringAlarm] = useState<Alarm | null>(null);
  
  const now = useTime(1000);
  const { toast } = useToast();
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);
  const lastFiredMinuteRef = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem("ultimate-clock-alarms", JSON.stringify(alarms));
  }, [alarms]);

  const checkAlarms = useCallback(() => {
    if (firingAlarm) return;

    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;
    const currentDayIdx = now.getDay();
    const ts = now.getTime();

    const triggered = alarms.find(a => {
      if (!a.enabled) return false;
      
      // Check snooze
      if (a.snoozedUntil && ts >= a.snoozedUntil) {
        return true;
      }
      
      // Normal check
      if (a.time === currentTime && lastFiredMinuteRef.current !== `${a.id}-${currentTime}`) {
        if (a.days.length === 0) return true;
        
        const activeToday = a.days.some(d => DAY_INDEX[d] === currentDayIdx);
        if (activeToday) return true;
      }
      return false;
    });

    if (triggered) {
      lastFiredMinuteRef.current = `${triggered.id}-${currentTime}`;
      setFiringAlarm(triggered);
      
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        stopSoundRef.current = playAlarmSound(triggered.sound, audioCtxRef.current);
      } catch(e) {
        console.error(e);
      }
    }
  }, [alarms, now, firingAlarm]);

  useEffect(() => {
    checkAlarms();
  }, [checkAlarms]);

  const addAlarm = () => {
    const alarm: Alarm = {
      id: crypto.randomUUID(),
      time: newTime,
      label: newLabel,
      days: newDays,
      sound: newSound,
      enabled: true
    };
    setAlarms([...alarms, alarm]);
    setIsAddModalOpen(false);
    
    // reset form
    setNewTime("07:00");
    setNewLabel("Alarm");
    setNewDays([]);
    setNewSound("Classic Beep");
    
    toast({ title: "Alarm added", description: `${newTime} - ${newLabel}` });
  };

  const toggleAlarm = (id: string, enabled: boolean) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, enabled, snoozedUntil: undefined } : a));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const dismissAlarm = () => {
    if (stopSoundRef.current) stopSoundRef.current();
    stopSoundRef.current = null;
    
    if (firingAlarm) {
      if (firingAlarm.days.length === 0) {
        // One-time alarm, disable it
        setAlarms(alarms.map(a => a.id === firingAlarm.id ? { ...a, enabled: false, snoozedUntil: undefined } : a));
      } else {
        setAlarms(alarms.map(a => a.id === firingAlarm.id ? { ...a, snoozedUntil: undefined } : a));
      }
    }
    setFiringAlarm(null);
  };

  const snoozeAlarm = () => {
    if (stopSoundRef.current) stopSoundRef.current();
    stopSoundRef.current = null;
    
    if (firingAlarm) {
      const snoozeTime = Date.now() + 5 * 60 * 1000;
      setAlarms(alarms.map(a => a.id === firingAlarm.id ? { ...a, snoozedUntil: snoozeTime } : a));
      toast({ title: "تم الغفوة", description: "سيرن المنبّه مرة أخرى بعد ٥ دقائق" });
    }
    setFiringAlarm(null);
  };

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const ARABIC_DAYS = {
    Mon: "الاثنين",
    Tue: "الثلاثاء",
    Wed: "الأربعاء",
    Thu: "الخميس",
    Fri: "الجمعة",
    Sat: "السبت",
    Sun: "الأحد"
  };
  const SHORT_ARABIC_DAYS = { Mon: "ن", Tue: "ث", Wed: "ر", Thu: "خ", Fri: "ج", Sat: "س", Sun: "ح" };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6" data-testid="section-alarms">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><BellRing className="w-6 h-6 text-primary" /> المنبّهات</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-alarm"><Plus className="w-4 h-4 ml-2" /> إضافة منبّه</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة منبّه جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>الوقت</Label>
                <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="text-xl font-mono text-left" dir="ltr" />
              </div>
              <div className="grid gap-2">
                <Label>الاسم</Label>
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="استيقاظ" />
              </div>
              <div className="grid gap-2">
                <Label>التكرار</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <Button
                      key={day}
                      variant={newDays.includes(day) ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10 p-0 rounded-full"
                      onClick={() => {
                        setNewDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
                      }}
                      title={ARABIC_DAYS[day]}
                    >
                      {SHORT_ARABIC_DAYS[day]}
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">{newDays.length === 0 ? "يرن مرة واحدة" : "يتكرر في الأيام المحددة"}</div>
              </div>
              <div className="grid gap-2">
                <Label>الصوت</Label>
                <Select value={newSound} onValueChange={setNewSound}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUNDS.map(s => <SelectItem key={s} value={s} dir="ltr">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>إلغاء</Button>
              <Button onClick={addAlarm}>حفظ المنبّه</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {alarms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed">
          <Clock className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-1">لا توجد منبّهات</h3>
          <p className="text-sm">اضغط الزر أعلاه لإضافة أول منبّه.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alarms.map(alarm => (
            <Card key={alarm.id} className={`p-5 flex items-center justify-between transition-colors ${alarm.enabled ? 'glass border-primary/20' : 'bg-muted/30 opacity-70'}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3" dir="ltr">
                  <span className="text-4xl font-bold font-mono tracking-tighter">{formatTimeDisplay(alarm.time).split(' ')[0]}</span>
                  <span className="text-lg font-medium text-muted-foreground">{formatTimeDisplay(alarm.time).split(' ')[1]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{alarm.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{alarm.sound}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {DAYS.map(d => (
                    <span key={d} className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${alarm.days.includes(d) ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground'}`}>
                      {SHORT_ARABIC_DAYS[d]}
                    </span>
                  ))}
                  {alarm.days.length === 0 && <span className="text-xs text-muted-foreground">مرة واحدة</span>}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Switch checked={alarm.enabled} onCheckedChange={(c) => toggleAlarm(alarm.id, c)} className="scale-125" />
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteAlarm(alarm.id)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Alarm Firing Overlay */}
      {firingAlarm && (
        <div className="fixed inset-0 z-[999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8">
            <BellRing className="w-24 h-24 text-primary animate-bounce mb-4" />
            <div className="space-y-2">
              <h2 className="text-6xl md:text-8xl font-bold font-mono tracking-tighter glow-text-primary" dir="ltr">{formatTimeDisplay(firingAlarm.time)}</h2>
              <p className="text-2xl text-muted-foreground font-medium uppercase tracking-widest">{firingAlarm.label}</p>
            </div>
            
            <div className="flex flex-col w-full gap-4 mt-8">
              <Button size="lg" className="w-full h-16 text-xl rounded-2xl" onClick={dismissAlarm} data-testid="btn-dismiss-alarm">
                إيقاف
              </Button>
              <Button size="lg" variant="outline" className="w-full h-16 text-xl rounded-2xl bg-background/50 backdrop-blur" onClick={snoozeAlarm} data-testid="btn-snooze-alarm">
                غفوة ٥ دقائق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
