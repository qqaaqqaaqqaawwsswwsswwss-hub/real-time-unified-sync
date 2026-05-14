import { useState } from "react";
import { useTime } from "@/hooks/use-time";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function AgeCalculator() {
  const [birthdate, setBirthdate] = useState("2000-01-01");
  const now = useTime(1000);

  const bDate = new Date(birthdate);
  const isValid = !isNaN(bDate.getTime());

  let ageStr = "--";
  let timeStr = "--";
  let daysStr = "--";
  let hoursStr = "--";
  let heartbeats = "--";
  let breaths = "--";
  let nextBdayStr = "--";

  if (isValid) {
    let years = now.getFullYear() - bDate.getFullYear();
    let months = now.getMonth() - bDate.getMonth();
    let days = now.getDate() - bDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    ageStr = `${years} سنة، ${months} شهر، ${days} يوم`;

    const diffMs = now.getTime() - bDate.getTime();
    const totalDays = Math.floor(diffMs / 86400000);
    const totalHours = Math.floor(diffMs / 3600000);

    const hrs = now.getHours() - bDate.getHours();
    const mins = now.getMinutes() - bDate.getMinutes();
    const secs = now.getSeconds() - bDate.getSeconds();
    
    // Simplistic time diff just for the ticking visual effect
    const h = (hrs + 24) % 24;
    const m = (mins + 60) % 60;
    const s = (secs + 60) % 60;
    timeStr = `${h} ساعة، ${m} دقيقة، ${s} ثانية`;

    daysStr = totalDays.toLocaleString("ar-EG") + " يوم";
    hoursStr = totalHours.toLocaleString("ar-EG") + " ساعة";

    heartbeats = Math.floor((diffMs / 60000) * 70).toLocaleString("ar-EG");
    breaths = Math.floor((diffMs / 60000) * 15).toLocaleString("ar-EG");

    const nextBday = new Date(now.getFullYear(), bDate.getMonth(), bDate.getDate());
    if (now.getTime() > nextBday.getTime() + 86400000) {
      nextBday.setFullYear(now.getFullYear() + 1);
    }
    const daysToNext = Math.ceil((nextBday.getTime() - now.getTime()) / 86400000);
    if (daysToNext === 0 || daysToNext === 365) {
      nextBdayStr = "عيد ميلادك اليوم! 🎂";
    } else {
      nextBdayStr = `عيد ميلادك القادم بعد ${daysToNext} يوم`;
    }
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="w-full max-w-sm">
        <Label className="mb-2 block">تاريخ الميلاد</Label>
        <Input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} dir="ltr" className="text-center" />
      </div>

      <Card className="w-full p-6 text-center glass border-primary/20 shadow-lg">
        <div className="text-4xl mb-4">🎂</div>
        <div className="text-2xl sm:text-3xl font-bold text-primary mb-2" dir="ltr">{ageStr}</div>
        <div className="text-lg text-muted-foreground font-mono mb-6" dir="ltr">{timeStr}</div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-muted-foreground mb-1">إجمالي الأيام</div>
            <div className="font-bold font-mono">{daysStr}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-muted-foreground mb-1">إجمالي الساعات</div>
            <div className="font-bold font-mono">{hoursStr}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-muted-foreground mb-1">نبضات القلب (تقريبي)</div>
            <div className="font-bold font-mono">{heartbeats}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-muted-foreground mb-1">الأنفاس (تقريبي)</div>
            <div className="font-bold font-mono">{breaths}</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t font-semibold text-lg text-accent">
          {nextBdayStr}
        </div>
      </Card>
    </div>
  );
}

function DateDiff() {
  const [from, setFrom] = useState("2024-01-01");
  const [to, setTo] = useState("2025-01-01");

  const fromD = new Date(from);
  const toD = new Date(to);
  const isValid = !isNaN(fromD.getTime()) && !isNaN(toD.getTime());

  let diffStr = "--";
  let detailsStr = "--";

  if (isValid) {
    const diffMs = Math.abs(toD.getTime() - fromD.getTime());
    const totalDays = Math.floor(diffMs / 86400000);
    
    let years = Math.abs(toD.getFullYear() - fromD.getFullYear());
    let months = toD.getMonth() - fromD.getMonth();
    let days = toD.getDate() - fromD.getDate();

    if (toD.getTime() < fromD.getTime()) {
      months = fromD.getMonth() - toD.getMonth();
      days = fromD.getDate() - toD.getDate();
    }

    if (days < 0) {
      months -= 1;
      days += 30; // Approx
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    diffStr = `${years} سنة، ${months} شهر، ${days} يوم`;
    detailsStr = `${totalDays.toLocaleString("ar-EG")} يوم | ${(totalDays * 24).toLocaleString("ar-EG")} ساعة | ${(totalDays * 24 * 60).toLocaleString("ar-EG")} دقيقة`;
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex gap-4 w-full max-w-lg">
        <div className="flex-1">
          <Label className="mb-2 block">من تاريخ</Label>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} dir="ltr" />
        </div>
        <div className="flex-1">
          <Label className="mb-2 block">إلى تاريخ</Label>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} dir="ltr" />
        </div>
      </div>
      <Card className="w-full max-w-lg p-8 text-center glass border-primary/20">
        <div className="text-xl sm:text-2xl font-bold text-primary mb-4" dir="ltr">{diffStr}</div>
        <div className="text-sm text-muted-foreground font-mono" dir="ltr">{detailsStr}</div>
      </Card>
    </div>
  );
}

const TZ_CITIES = [
  { name: "لوس أنجلوس", tz: "America/Los_Angeles" },
  { name: "نيويورك", tz: "America/New_York" },
  { name: "لندن", tz: "Europe/London" },
  { name: "باريس", tz: "Europe/Paris" },
  { name: "الرياض", tz: "Asia/Riyadh" },
  { name: "دبي", tz: "Asia/Dubai" },
  { name: "مومباي", tz: "Asia/Kolkata" },
  { name: "طوكيو", tz: "Asia/Tokyo" },
  { name: "سيدني", tz: "Australia/Sydney" },
];

function TzPlanner() {
  const [baseTime, setBaseTime] = useState("12:00");
  const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const baseDateTime = new Date(`${baseDate}T${baseTime}:00`);

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex gap-4 w-full max-w-md bg-muted/30 p-4 rounded-xl">
        <div className="flex-1">
          <Label className="mb-2 block">التاريخ</Label>
          <Input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} dir="ltr" />
        </div>
        <div className="flex-1">
          <Label className="mb-2 block">الوقت (محلي)</Label>
          <Input type="time" value={baseTime} onChange={e => setBaseTime(e.target.value)} dir="ltr" />
        </div>
      </div>

      <div className="w-full max-w-2xl bg-card rounded-xl border overflow-hidden">
        <div className="grid grid-cols-4 p-4 bg-muted/50 font-semibold text-sm border-b">
          <div className="col-span-1">المدينة</div>
          <div className="col-span-1 text-center">الوقت</div>
          <div className="col-span-1 text-center">التاريخ</div>
          <div className="col-span-1 text-center">حالة العمل</div>
        </div>
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {TZ_CITIES.map(c => {
            const fmtTime = new Intl.DateTimeFormat('ar-EG', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hour12: false });
            const fmtDate = new Intl.DateTimeFormat('ar-EG', { timeZone: c.tz, month: 'short', day: 'numeric' });
            const hrFmt = new Intl.DateTimeFormat('en-US', { timeZone: c.tz, hour: 'numeric', hour12: false });
            
            let timeStr = "--:--";
            let dateStr = "--/--";
            let hrNum = 0;
            if (!isNaN(baseDateTime.getTime())) {
              timeStr = fmtTime.format(baseDateTime);
              dateStr = fmtDate.format(baseDateTime);
              hrNum = Number(hrFmt.format(baseDateTime));
            }
            const isWorkingHour = hrNum >= 9 && hrNum < 18;

            return (
              <div key={c.tz} className="grid grid-cols-4 p-4 items-center text-sm">
                <div className="col-span-1 font-medium">{c.name}</div>
                <div className="col-span-1 text-center font-mono" dir="ltr">{timeStr}</div>
                <div className="col-span-1 text-center">{dateStr}</div>
                <div className="col-span-1 flex justify-center">
                  <span className={`w-3 h-3 rounded-full ${isWorkingHour ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} title={isWorkingHour ? 'أوقات عمل' : 'خارج أوقات العمل'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Calculators() {
  const [tab, setTab] = useState<"age" | "datediff" | "tz">("age");

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-4">
      <div className="flex gap-2 bg-muted/50 p-1 rounded-full mb-8 overflow-x-auto w-full max-w-md justify-center">
        <Button variant={tab === "age" ? "default" : "ghost"} className="rounded-full flex-1" onClick={() => setTab("age")}>حاسبة العمر</Button>
        <Button variant={tab === "datediff" ? "default" : "ghost"} className="rounded-full flex-1 whitespace-nowrap" onClick={() => setTab("datediff")}>فارق التاريخ</Button>
        <Button variant={tab === "tz" ? "default" : "ghost"} className="rounded-full flex-1 whitespace-nowrap" onClick={() => setTab("tz")}>منظّم الاجتماعات</Button>
      </div>

      <div className="w-full">
        {tab === "age" && <AgeCalculator />}
        {tab === "datediff" && <DateDiff />}
        {tab === "tz" && <TzPlanner />}
      </div>
    </div>
  );
}
