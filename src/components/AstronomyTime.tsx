import { useTime } from "@/hooks/use-time";
import { getMoonPhase } from "@/lib/time-utils";
import { Card } from "@/components/ui/card";

function getSunriseSunset(date: Date, tzOffset: number) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const B = (360 / 365) * (dayOfYear - 81);
  const Brad = (B * Math.PI) / 180;
  const eqTime = 9.87 * Math.sin(2 * Brad) - 7.53 * Math.cos(Brad) - 1.5 * Math.sin(Brad);
  const decl = 23.45 * Math.sin(Brad);
  const lat = 0;
  const HA = Math.acos(
    (Math.cos(90.833 * Math.PI / 180) -
      Math.sin(lat * Math.PI / 180) * Math.sin(decl * Math.PI / 180)) /
    (Math.cos(lat * Math.PI / 180) * Math.cos(decl * Math.PI / 180))
  );
  const HADeg = (HA * 180) / Math.PI;
  const sunrise = 720 - 4 * (0 + HADeg) - eqTime;
  const sunset = 720 - 4 * (0 - HADeg) - eqTime;
  const noon = 720 - eqTime;

  function minsToTime(mins: number) {
    const totalMins = mins + tzOffset;
    const h = Math.floor(((totalMins % 1440) + 1440) / 60) % 24;
    const m = Math.floor(((totalMins % 1440) + 1440) % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  const dayLength = (sunset - sunrise) / 60;
  return {
    sunrise: minsToTime(sunrise),
    sunset: minsToTime(sunset),
    noon: minsToTime(noon),
    dayLengthH: Math.floor(dayLength),
    dayLengthM: Math.round((dayLength % 1) * 60),
  };
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
      <span className="font-mono text-2xl font-bold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </Card>
  );
}

export function AstronomyTime() {
  const now = useTime(1000);
  const moon = getMoonPhase(now);
  const tzOffset = -now.getTimezoneOffset();
  const sun = getSunriseSunset(now, tzOffset);

  const daysToFullMoon = moon.phase < 0.5
    ? ((0.5 - moon.phase) * 29.53).toFixed(1)
    : ((1.5 - moon.phase) * 29.53).toFixed(1);

  return (
    <section className="flex flex-col gap-8" data-testid="section-astronomy">
      <div>
        <h2 className="text-xl font-semibold mb-1">القمر</h2>
        <p className="text-muted-foreground text-sm mb-5">طور القمر ونسبة الإضاءة محسوبة من الدورة القمرية</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoCard
            label="طور القمر"
            value={`${moon.emoji} ${moon.name}`}
            sub={`الدورة: ${(moon.phase * 100).toFixed(1)}%`}
          />
          <InfoCard
            label="نسبة الإضاءة"
            value={`${moon.illumination.toFixed(1)}%`}
            sub="نسبة سطح القمر المضيء"
          />
          <InfoCard
            label="أيام حتى البدر"
            value={`${daysToFullMoon} أيام`}
            sub="تقريبي"
          />
          <InfoCard
            label="عمر القمر"
            value={`${(moon.phase * 29.53).toFixed(1)} أيام`}
            sub="منذ آخر هلال"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-1">الشمس</h2>
        <p className="text-muted-foreground text-sm mb-5">شروق وغروب الشمس التقريبي عند خط الاستواء</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" dir="ltr">
          <InfoCard
            label="الشروق"
            value={sun.sunrise}
            sub="توقيت محلي تقريبي"
          />
          <InfoCard
            label="الظهيرة الشمسية"
            value={sun.noon}
            sub="الشمس في الذروة"
          />
          <InfoCard
            label="الغروب"
            value={sun.sunset}
            sub="توقيت محلي تقريبي"
          />
          <InfoCard
            label="طول النهار"
            value={`${sun.dayLengthH}h ${sun.dayLengthM}m`}
            sub="ساعات الضوء"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-muted/30 text-muted-foreground text-xs">
        يتم حساب جميع البيانات الفلكية في المتصفح باستخدام الرياضيات البحتة. يتم تقريب الشروق/الغروب عند خط الاستواء (خط العرض 0) وتعديله حسب منطقتك الزمنية.
      </div>
    </section>
  );
}
