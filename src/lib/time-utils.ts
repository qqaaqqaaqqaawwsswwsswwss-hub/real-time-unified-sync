export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getModifiedJulianDate(date: Date): number {
  return getJulianDate(date) - 2400000.5;
}

export function getJ2000(date: Date): number {
  return getJulianDate(date) - 2451545.0;
}

export function getTAI(date: Date): number {
  // Approximate TAI (UTC + 37 seconds as of 2017)
  return date.getTime() / 1000 + 37;
}

export function getGPS(date: Date): number {
  // GPS epoch is Jan 6, 1980
  const gpsEpoch = new Date("1980-01-06T00:00:00Z").getTime();
  // GPS does not count leap seconds, currently ahead of UTC by 18s (TAI - 19s)
  return (date.getTime() - gpsEpoch) / 1000 + 18;
}

export function getPOSIX(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function getMoonPhase(date: Date): { phase: number, name: string, emoji: string, illumination: number, nextFull: number } {
  // Synodic month = 29.53058868 days
  const lp = 2551443;
  const now = date.getTime() / 1000;
  const newMoon = 918758040; // Approx known new moon
  const phase = ((now - newMoon) % lp) / lp;
  
  const daysInPhase = phase * 29.53;
  let name = "New Moon";
  let emoji = "🌑";
  
  if (daysInPhase < 1.84) { name = "New Moon"; emoji = "🌑"; }
  else if (daysInPhase < 5.53) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (daysInPhase < 9.22) { name = "First Quarter"; emoji = "🌓"; }
  else if (daysInPhase < 12.91) { name = "Waxing Gibbous"; emoji = "🌔"; }
  else if (daysInPhase < 16.61) { name = "Full Moon"; emoji = "🌕"; }
  else if (daysInPhase < 20.3) { name = "Waning Gibbous"; emoji = "🌖"; }
  else if (daysInPhase < 23.99) { name = "Last Quarter"; emoji = "🌗"; }
  else if (daysInPhase < 27.68) { name = "Waning Crescent"; emoji = "🌘"; }
  else { name = "New Moon"; emoji = "🌑"; }
  
  const illumination = (0.5 * (1 - Math.cos(phase * 2 * Math.PI))) * 100;
  const nextFull = 29.53 - (phase > 0.5 ? phase - 0.5 : phase + 0.5) * 29.53;
  
  return { phase, name, emoji, illumination, nextFull };
}

export function getIslamicDate(date: Date): string {
  // Approximate Hijri
  return new Intl.DateTimeFormat('en-US-u-ca-islamic', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

export function getHebrewDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

export function getPersianDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US-u-ca-persian', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

export function getChineseDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US-u-ca-chinese', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
}

export function getISOWeekDate(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}-${dayNum}`;
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
