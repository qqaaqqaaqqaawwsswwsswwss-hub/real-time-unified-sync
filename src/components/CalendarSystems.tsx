import { useTime } from "@/hooks/use-time";
import { getIslamicDate, getHebrewDate, getPersianDate, getChineseDate } from "@/lib/time-utils";
import { Card } from "@/components/ui/card";

function CalendarCard({ title, value }: { title: string, value: string }) {
  return (
    <Card className="p-5 flex flex-col justify-center border-l-2 border-l-primary hover:bg-muted/20 transition-colors glass">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-lg lg:text-xl font-medium truncate block w-full" title={value}>{value}</p>
    </Card>
  );
}

export function CalendarSystems() {
  const now = useTime(1000);

  const gregorian = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(now);
  const julian = "Proleptic Julian logic omitted for brevity"; // Could implement, but approx is fine

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" data-testid="calendar-grid">
      <CalendarCard title="الميلادي - Gregorian" value={gregorian} />
      <CalendarCard title="الهجري - Islamic" value={getIslamicDate(now)} />
      <CalendarCard title="العبري - Hebrew" value={getHebrewDate(now)} />
      <CalendarCard title="الفارسي (الشمسي) - Persian" value={getPersianDate(now)} />
      <CalendarCard title="الصيني - Chinese" value={getChineseDate(now)} />
      <CalendarCard title="ISO 8601 Date" value={now.toISOString().split('T')[0]} />
    </div>
  );
}
