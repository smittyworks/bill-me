/** Format "HH:MM:SS" (Postgres TIME) → "9:30 AM" */
export function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
}

/** Format duration_minutes → "30m", "1h", "1h 30m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Add duration_minutes to a "HH:MM:SS" time string, returns "HH:MM:SS" */
export function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:00`;
}

/** Get today's date as "YYYY-MM-DD" in local time */
export function todayLocalDate(): string {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

/** Round up to the next 30-min boundary, returns "HH:MM" */
export function nextHalfHour(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = minutes < 30 ? 30 : 0;
  const addHour = minutes >= 30 ? 1 : 0;
  const hour = (now.getHours() + addHour) % 24;
  return `${String(hour).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
}

/** Convert "HH:MM:SS" to minutes since midnight */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}
