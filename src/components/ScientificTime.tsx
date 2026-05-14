import { useTime } from "@/hooks/use-time";
import { getJulianDate, getModifiedJulianDate, getJ2000, getTAI, getGPS, getPOSIX } from "@/lib/time-utils";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function ValueCard({ title, value, unit = "", sub = "" }: { title: string, value: number | string, unit?: string, sub?: string }) {
  const { toast } = useToast();
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value.toString());
    toast({ title: "تم النسخ بنجاح", duration: 2000 });
  };

  return (
    <Card className="p-4 flex flex-col justify-between group border-l-2 border-l-primary glass">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{title}</h3>
          {sub && <div className="text-xs text-muted-foreground/70">{sub}</div>}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopy}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex items-baseline gap-2 overflow-x-auto pb-1 scrollbar-none w-full" dir="ltr">
        <span className="text-2xl lg:text-3xl font-mono tabular-nums font-bold text-primary truncate max-w-full block" title={value.toString()}>
          {typeof value === 'number' ? value.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 5 }) : value}
        </span>
        {unit && <span className="text-xs text-muted-foreground whitespace-nowrap">{unit}</span>}
      </div>
    </Card>
  );
}

export function ScientificTime() {
  const now = useTime(1000);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="scientific-grid">
      <ValueCard title="Unix Timestamp" sub="توقيت يونكس" value={Math.floor(now.getTime() / 1000)} unit="s" />
      <ValueCard title="Unix (ms)" sub="توقيت يونكس (بالمللي ثانية)" value={now.getTime()} unit="ms" />
      <ValueCard title="POSIX Time" sub="توقيت بوزيكس" value={getPOSIX(now)} unit="s" />
      <ValueCard title="Julian Date (JD)" sub="التاريخ اليولياني" value={getJulianDate(now).toFixed(5)} unit="days" />
      <ValueCard title="Modified JD" sub="التاريخ اليولياني المعدل" value={getModifiedJulianDate(now).toFixed(5)} unit="days" />
      <ValueCard title="J2000.0" sub="حقبة ج٢٠٠٠" value={getJ2000(now).toFixed(5)} unit="days" />
      <ValueCard title="TAI Time" sub="التوقيت الذري الدولي" value={getTAI(now).toFixed(0)} unit="s" />
      <ValueCard title="GPS Time" sub="توقيت نظام تحديد المواقع" value={getGPS(now).toFixed(0)} unit="s" />
      <ValueCard title="Heliocentric JD" sub="التاريخ اليولياني الشمسي" value={(getJulianDate(now) + 0.005).toFixed(5)} unit="days (approx)" />
    </div>
  );
}
