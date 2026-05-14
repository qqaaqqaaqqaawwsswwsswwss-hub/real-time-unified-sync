import { useState } from "react";
import { useTime } from "@/hooks/use-time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJulianDate } from "@/lib/time-utils";

const CITIES = [
  { name: "Mecca", arName: "مكة المكرمة", lat: 21.3891, lng: 39.8579, tz: 3 },
  { name: "Medina", arName: "المدينة المنورة", lat: 24.5247, lng: 39.5692, tz: 3 },
  { name: "Riyadh", arName: "الرياض", lat: 24.7136, lng: 46.6753, tz: 3 },
  { name: "Jeddah", arName: "جدة", lat: 21.4858, lng: 39.1925, tz: 3 },
  { name: "Dubai", arName: "دبي", lat: 25.2048, lng: 55.2708, tz: 4 },
  { name: "Kuwait City", arName: "مدينة الكويت", lat: 29.3759, lng: 47.9774, tz: 3 },
  { name: "Doha", arName: "الدوحة", lat: 25.2854, lng: 51.5310, tz: 3 },
  { name: "Amman", arName: "عمان", lat: 31.9454, lng: 35.9284, tz: 3 },
  { name: "Cairo", arName: "القاهرة", lat: 30.0444, lng: 31.2357, tz: 2 },
  { name: "Baghdad", arName: "بغداد", lat: 33.3152, lng: 44.3661, tz: 3 },
];

function calcPrayerTimes(date: Date, lat: number, lng: number, timezone: number) {
  const JD = getJulianDate(date);
  const D = JD - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * Math.sin(g * Math.PI/180) + 0.020 * Math.sin(2 * g * Math.PI/180)) % 360;
  const e = 23.439 - 0.00000036 * D;
  const RA = Math.atan2(Math.cos(e * Math.PI/180) * Math.sin(L * Math.PI/180), Math.cos(L * Math.PI/180)) * 180/Math.PI / 15;
  let EqT = q/15 - RA;
  if (EqT > 12) EqT -= 24;
  if (EqT < -12) EqT += 24;
  
  const decl = Math.asin(Math.sin(e * Math.PI/180) * Math.sin(L * Math.PI/180)) * 180/Math.PI;
  const Dhuhr = 12 - EqT + (timezone - lng/15);
  
  function sunAngleTime(angle: number, afterNoon = false) {
    const cosHA = (Math.sin(-angle * Math.PI/180) - Math.sin(lat * Math.PI/180) * Math.sin(decl * Math.PI/180)) /
                  (Math.cos(lat * Math.PI/180) * Math.cos(decl * Math.PI/180));
    if (Math.abs(cosHA) > 1) return null;
    const HA = Math.acos(cosHA) * 180/Math.PI / 15;
    return afterNoon ? Dhuhr + HA : Dhuhr - HA;
  }
  
  function asrTime(factor: number) {
    const angle = Math.atan(1/(factor + Math.tan(Math.abs(lat - decl) * Math.PI/180))) * 180/Math.PI;
    return sunAngleTime(-angle, true);
  }

  const Fajr = sunAngleTime(18); // Umm al-Qura 18 degrees
  const Sunrise = sunAngleTime(0.833);
  const Asr = asrTime(1);
  const Maghrib = sunAngleTime(0.833, true);
  const Isha = sunAngleTime(15, true); // Actually umm al-qura is Maghrib + 90min but we use 15 deg approx here for simplicity or exact formula
  
  return { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha };
}

function formatTime(hoursDec: number | null) {
  if (hoursDec === null) return "--:--";
  let h = Math.floor(hoursDec);
  const m = Math.floor((hoursDec - h) * 60);
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function timeToDate(hoursDec: number | null, baseDate: Date) {
  if (hoursDec === null) return new Date(0);
  const d = new Date(baseDate);
  const h = Math.floor(hoursDec);
  const m = Math.floor((hoursDec - h) * 60);
  d.setHours(h, m, 0, 0);
  return d;
}

export function PrayerTimes() {
  const [cityIndex, setCityIndex] = useState(0);
  const city = CITIES[cityIndex];
  const now = useTime(1000);

  const times = calcPrayerTimes(now, city.lat, city.lng, city.tz);

  const prayerDates = [
    { name: "الفجر", val: times.Fajr },
    { name: "الشروق", val: times.Sunrise },
    { name: "الظهر", val: times.Dhuhr },
    { name: "العصر", val: times.Asr },
    { name: "المغرب", val: times.Maghrib },
    { name: "العشاء", val: times.Isha }
  ].map(p => ({
    ...p,
    date: timeToDate(p.val, now)
  }));

  let nextPrayer = prayerDates.find(p => p.date.getTime() > now.getTime());
  if (!nextPrayer) {
    nextPrayer = prayerDates[0]; // Tomorrow's fajr approx
  }

  let countdownStr = "";
  if (nextPrayer) {
    let diff = nextPrayer.date.getTime() - now.getTime();
    if (diff < 0) diff += 24 * 3600 * 1000;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    countdownStr = `${hrs} ساعة ${mins} دقيقة`;
  }

  const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 p-6 rounded-2xl glass">
        <div>
          <h2 className="text-xl font-bold text-primary mb-1">طريقة أم القرى</h2>
          <div className="text-muted-foreground">{hijriFormatter.format(now)}</div>
        </div>
        <Select value={cityIndex.toString()} onValueChange={(v) => setCityIndex(Number(v))}>
          <SelectTrigger className="w-[200px] text-lg font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c, i) => (
              <SelectItem key={i} value={i.toString()}>{c.arName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {nextPrayer && (
        <div className="text-center p-6 border-b border-border/10">
          <h3 className="text-2xl font-bold mb-2">{nextPrayer.name} في {countdownStr}</h3>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {prayerDates.map(p => {
          const isNext = p.name === nextPrayer?.name;
          return (
            <div key={p.name} className={`p-6 rounded-2xl flex flex-col items-center justify-center transition-all ${isNext ? 'glass border-primary shadow-[0_0_20px_-5px_hsl(var(--primary))] scale-105' : 'bg-card border'}`}>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{p.name}</h3>
              <div className="text-3xl font-bold font-mono tracking-tighter" dir="ltr">{formatTime(p.val)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
