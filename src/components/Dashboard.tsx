import { useState } from "react";
import { useTime, usePreferences } from "@/hooks/use-time";
import { MainClock } from "@/components/MainClock";
import { WorldClock } from "@/components/WorldClock";
import { ScientificTime } from "@/components/ScientificTime";
import { CalendarSystems } from "@/components/CalendarSystems";
import { DevTime } from "@/components/DevTime";
import { AstronomyTime } from "@/components/AstronomyTime";
import { StopwatchTimer } from "@/components/StopwatchTimer";
import { Pomodoro } from "@/components/Pomodoro";
import { AlarmClock } from "@/components/AlarmClock";
import { MusicPlayer } from "@/components/MusicPlayer";
import { PrayerTimes } from "@/components/PrayerTimes";
import { Calculators } from "@/components/Calculators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const { theme, setTheme } = useTheme();

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-border/20 glass">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
          <div className="ml-4 flex">
            <a className="ml-6 flex items-center space-x-2 space-x-reverse" href="/">
              <span className="font-extrabold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-l from-primary to-accent">Ultimate Clock</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2 space-x-reverse">
            <nav className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs text-muted-foreground hidden sm:block font-mono">by حسين ضياء • MDRTech</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                data-testid="button-theme-toggle"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-screen-2xl p-4 md:p-8 flex flex-col gap-12 pb-24">
        <MainClock />
        
        <Tabs defaultValue="alarm" className="w-full">
          <div className="flex justify-start mb-8 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:justify-center w-full">
            <TabsList className="glass border h-auto flex-nowrap p-1 gap-1 min-w-max mx-auto md:mx-0">
              <TabsTrigger value="alarm" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">المنبّه</TabsTrigger>
              <TabsTrigger value="prayer" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">مواقيت الصلاة</TabsTrigger>
              <TabsTrigger value="music" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">الموسيقى</TabsTrigger>
              <TabsTrigger value="world" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">ساعة العالم</TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">ساعة الإيقاف</TabsTrigger>
              <TabsTrigger value="pomodoro" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">بومودورو</TabsTrigger>
              <TabsTrigger value="calculators" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">حاسبات</TabsTrigger>
              <TabsTrigger value="astronomy" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">الفلك</TabsTrigger>
              <TabsTrigger value="calendars" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">التقويمات</TabsTrigger>
              <TabsTrigger value="scientific" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">الوقت العلمي</TabsTrigger>
              <TabsTrigger value="dev" className="data-[state=active]:border data-[state=active]:border-primary/50 data-[state=active]:glow-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent">المطوّرون</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="alarm" className="focus-visible:outline-none">
            <AlarmClock />
          </TabsContent>
          <TabsContent value="prayer" className="focus-visible:outline-none">
            <PrayerTimes />
          </TabsContent>
          <TabsContent value="music" className="focus-visible:outline-none">
            <MusicPlayer />
          </TabsContent>
          <TabsContent value="world" className="focus-visible:outline-none">
            <WorldClock />
          </TabsContent>
          <TabsContent value="tools" className="focus-visible:outline-none">
            <StopwatchTimer />
          </TabsContent>
          <TabsContent value="pomodoro" className="focus-visible:outline-none">
            <Pomodoro />
          </TabsContent>
          <TabsContent value="calculators" className="focus-visible:outline-none">
            <Calculators />
          </TabsContent>
          <TabsContent value="astronomy" className="focus-visible:outline-none">
            <AstronomyTime />
          </TabsContent>
          <TabsContent value="calendars" className="focus-visible:outline-none">
            <CalendarSystems />
          </TabsContent>
          <TabsContent value="scientific" className="focus-visible:outline-none">
            <ScientificTime />
          </TabsContent>
          <TabsContent value="dev" className="focus-visible:outline-none">
            <DevTime />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/20 py-6 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-l from-primary to-accent">MDRTech</span>
          <span className="text-muted-foreground text-sm">صُنع بعناية بواسطة <span className="text-foreground font-medium">حسين ضياء</span></span>
          <span className="text-muted-foreground text-xs">Ultimate Clock — المرجع الرسمي للوقت</span>
        </div>
      </footer>
    </div>
  );
}
