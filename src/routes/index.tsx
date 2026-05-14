import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ultimate Clock — المرجع الرسمي للوقت" },
      {
        name: "description",
        content:
          "ساعة عالمية رسمية بمزايا قوية: منبّه، مواقيت الصلاة، ساعة العالم، بومودورو، فلك، تقويمات، وأدوات للمطوّرين.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Dashboard />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </ThemeProvider>
  );
}
