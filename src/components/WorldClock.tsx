import { useTime } from "@/hooks/use-time";
import { Card } from "@/components/ui/card";

const CITIES = [
  { name: "New York", tz: "America/New_York", flag: "🇺🇸" },
  { name: "London", tz: "Europe/London", flag: "🇬🇧" },
  { name: "Tokyo", tz: "Asia/Tokyo", flag: "🇯🇵" },
  { name: "Dubai", tz: "Asia/Dubai", flag: "🇦🇪" },
  { name: "Sydney", tz: "Australia/Sydney", flag: "🇦🇺" },
  { name: "Paris", tz: "Europe/Paris", flag: "🇫🇷" },
  { name: "Beijing", tz: "Asia/Shanghai", flag: "🇨🇳" },
  { name: "Moscow", tz: "Europe/Moscow", flag: "🇷🇺" },
  { name: "São Paulo", tz: "America/Sao_Paulo", flag: "🇧🇷" },
  { name: "Mumbai", tz: "Asia/Kolkata", flag: "🇮🇳" },
  { name: "Cairo", tz: "Africa/Cairo", flag: "🇪🇬" },
  { name: "Los Angeles", tz: "America/Los_Angeles", flag: "🇺🇸" },
];

export function WorldClock() {
  const now = useTime(1000);
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" data-testid="world-clock-grid">
      {CITIES.map(city => {
        const isLocal = city.tz === localTz;
        const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: city.tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false });
        const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: city.tz, month: 'short', day: 'numeric', year: 'numeric' });
        
        // Calculate offset
        const cityDate = new Date(now.toLocaleString("en-US", { timeZone: city.tz }));
        const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
        const diffHours = Math.round((cityDate.getTime() - utcDate.getTime()) / 3600000 * 10) / 10;
        const offsetStr = diffHours >= 0 ? `+${diffHours}` : `${diffHours}`;

        return (
          <Card key={city.name} className={`min-h-0 p-3 sm:p-4 flex flex-col gap-1 sm:gap-2 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 ${isLocal ? 'border-primary shadow-[0_0_15px_-3px_hsl(var(--primary))]' : ''}`}>
            {isLocal && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">محلي</div>}
            <div className="flex justify-between items-start">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-xl">{city.flag}</span>
                <span>{city.name}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded" dir="ltr">UTC{offsetStr}</div>
            </div>
            <div dir="ltr" className="text-right">
              <div className="text-2xl sm:text-3xl font-mono tabular-nums font-bold tracking-tight">{timeFmt.format(now)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{dateFmt.format(now)}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
