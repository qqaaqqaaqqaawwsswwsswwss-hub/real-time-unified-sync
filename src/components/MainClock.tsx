import { useTime, usePreferences } from "@/hooks/use-time";
import { getDayOfYear, getISOWeekDate } from "@/lib/time-utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Globe } from "lucide-react";
import { useState } from "react";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Paris",
  "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney", "Asia/Dubai", "Asia/Kolkata"
];

export function MainClock() {
  const now = useTime(16);
  const [prefs, setPrefs] = usePreferences();
  const [showSettings, setShowSettings] = useState(false);

  const tz = prefs.timezone || "UTC";
  const is24h = prefs.is24h ?? false;

  const fmtTime = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: !is24h,
    fractionalSecondDigits: 3
  } as Intl.DateTimeFormatOptions).format(now);
  
  // Format returns e.g. "14:05:01.123" or "2:05:01.123 PM"
  // Let's split it nicely
  const timeMatch = fmtTime.match(/(\d+):(\d+):(\d+)\.(\d+)\s?(AM|PM)?/i);
  let h = "00", m = "00", s = "00", ms = "000", ampm = "";
  if (timeMatch) {
    h = timeMatch[1].padStart(2, '0');
    m = timeMatch[2];
    s = timeMatch[3];
    ms = timeMatch[4];
    ampm = timeMatch[5] || "";
  }

  const fmtDateLong = new Intl.DateTimeFormat("en-US", { timeZone: tz, dateStyle: "full" }).format(now);
  const fmtDateISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const dayOfYear = getDayOfYear(now);
  const weekISO = getISOWeekDate(now);
  const quarter = Math.floor(now.getMonth() / 3) + 1;

  return (
    <section className="flex flex-col items-center justify-center py-12 relative bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_60%)] rounded-3xl">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} data-testid="btn-main-settings">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {showSettings && (
        <div className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-auto sm:top-16 sm:right-4 w-full sm:w-auto z-50 p-6 sm:p-4 rounded-t-2xl sm:rounded-xl border glass shadow-2xl flex flex-col gap-6 sm:gap-4 animate-in slide-in-from-bottom-10 sm:slide-in-from-top-2">
          <div className="flex items-center justify-between gap-8">
            <Label htmlFor="24h-mode">توقيت ٢٤ ساعة</Label>
            <Switch id="24h-mode" checked={is24h} onCheckedChange={(c) => setPrefs({ is24h: c })} data-testid="switch-24h" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>المنطقة الزمنية</Label>
            <Select value={tz} onValueChange={(v) => setPrefs({ timezone: v })}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:hidden flex justify-end">
            <Button variant="outline" className="w-full" onClick={() => setShowSettings(false)}>إغلاق</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 w-full px-2">
        <div className="flex items-center gap-2 text-primary font-mono text-sm uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20 glow-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
          مباشر • {tz}
        </div>

        <div className="flex items-baseline justify-center font-mono font-bold tracking-tighter tabular-nums text-foreground drop-shadow-lg w-full max-w-[100vw] overflow-hidden" dir="ltr">
          <span className="text-[clamp(3rem,15vw,9rem)] glow-text-primary">{h}:{m}:{s}</span>
          <span className="text-[clamp(1.5rem,5vw,5rem)] text-muted-foreground ml-1 sm:ml-2 opacity-80">.{ms}</span>
          {ampm && <span className="text-[clamp(1rem,4vw,4rem)] text-primary ml-2 sm:ml-4 uppercase tracking-widest">{ampm}</span>}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 text-muted-foreground font-mono text-sm md:text-base w-full justify-center" dir="ltr">
          <div className="px-4 py-2 glass rounded-lg shadow-sm w-full md:w-auto text-center">{fmtDateLong}</div>
          <div className="px-4 py-2 glass rounded-lg shadow-sm w-full md:w-auto text-center">{fmtDateISO}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-2xl mt-4">
          <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl glass shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest text-center">يوم السنة</span>
            <span className="font-mono text-base sm:text-lg font-semibold">{dayOfYear}</span>
          </div>
          <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl glass shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest text-center">أسبوع ISO</span>
            <span className="font-mono text-base sm:text-lg font-semibold">{weekISO.split('-')[1]}</span>
          </div>
          <div className="flex flex-col items-center p-2 sm:p-3 rounded-xl glass shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest text-center">الربع</span>
            <span className="font-mono text-base sm:text-lg font-semibold">Q{quarter}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
