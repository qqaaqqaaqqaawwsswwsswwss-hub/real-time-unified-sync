import { useTime } from "@/hooks/use-time";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type LangInfo = { name: string, code: string, color: string, getVal: (d: Date) => string };

const langs: LangInfo[] = [
  { name: "JavaScript", code: "new Date().toISOString()", color: "#f7df1e", getVal: d => `"${d.toISOString()}"` },
  { name: "Python", code: "datetime.now(timezone.utc).isoformat()", color: "#3776ab", getVal: d => `'${d.toISOString()}'` },
  { name: "Unix Shell", code: "date +%s", color: "#4Eaa25", getVal: d => Math.floor(d.getTime() / 1000).toString() },
  { name: "C/C++", code: "time(NULL)", color: "#00599C", getVal: d => Math.floor(d.getTime() / 1000).toString() },
  { name: "Go", code: "time.Now().UTC().Format(time.RFC3339Nano)", color: "#00ADD8", getVal: d => `"${d.toISOString()}"` },
  { name: "Rust", code: "SystemTime::now()", color: "#dea584", getVal: d => `Duration { secs: ${Math.floor(d.getTime() / 1000)}, nanos: ${(d.getTime() % 1000) * 1000000} }` },
  { name: "Java", code: "Instant.now().toString()", color: "#b07219", getVal: d => `"${d.toISOString()}"` },
  { name: "SQL", code: "CURRENT_TIMESTAMP", color: "#e38c00", getVal: d => `'${d.toISOString().replace('T', ' ').split('.')[0]}'` },
  { name: "PHP", code: "date('c')", color: "#777bb4", getVal: d => `'${d.toISOString()}'` },
  { name: "Ruby", code: "Time.now.utc.iso8601", color: "#701516", getVal: d => `"${d.toISOString()}"` },
];

export function DevTime() {
  const now = useTime(1000);
  const { toast } = useToast();

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "تم نسخ المخرجات", duration: 2000 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {langs.map(l => (
        <Card key={l.name} className="flex flex-col w-full overflow-hidden group glass">
          <div className="px-4 py-2 border-b bg-muted/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="font-semibold text-sm">{l.name}</span>
            </div>
          </div>
          <div className="p-4 bg-zinc-950 dark:bg-zinc-950 text-zinc-300 font-mono text-xs flex flex-col gap-3 w-full overflow-x-auto scrollbar-none">
            <div className="text-zinc-400 select-all whitespace-nowrap">{l.code}</div>
            <div className="flex items-center justify-between group/val">
              <div className="text-green-400 font-bold whitespace-nowrap pr-4">➔ {l.getVal(now)}</div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-100 opacity-100 sm:opacity-0 group-hover/val:opacity-100 shrink-0" onClick={() => handleCopy(l.getVal(now))}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
