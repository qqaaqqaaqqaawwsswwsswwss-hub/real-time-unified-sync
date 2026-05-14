import { useState, useEffect, useCallback } from "react";

export function useTime(intervalMs: number = 1000) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let frameId: number;
    let lastUpdate = performance.now();

    if (intervalMs < 50) {
      // High precision for 16ms
      const loop = (time: number) => {
        setNow(new Date());
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);
    } else {
      const interval = setInterval(() => {
        setNow(new Date());
      }, intervalMs);
      return () => clearInterval(interval);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [intervalMs]);

  return now;
}

export function usePreferences() {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("clock-prefs");
    return saved ? JSON.parse(saved) : { is24h: false, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  });

  const updatePreferences = useCallback((newPrefs: any) => {
    setPreferences((prev: any) => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem("clock-prefs", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return [preferences, updatePreferences] as const;
}
