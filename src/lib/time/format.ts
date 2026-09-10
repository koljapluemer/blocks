/** Local calendar day, `YYYY-MM-DD`. */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Time of day, no seconds, locale-aware (e.g. "2:45 PM" or "14:45"). */
export function formatTimeOfDay(input: number | Date): string {
  const d = typeof input === 'number' ? new Date(input) : input;
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** "Today" / "Yesterday" / "Wed 8 Sep" for a dayKey. */
export function formatDayHeader(key: string, now: number = Date.now()): string {
  if (key === dayKey(now)) return 'Today';
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (key === dayKey(y.getTime())) return 'Yesterday';

  const [yr, mo, da] = key.split('-').map(Number);
  return new Date(yr, mo - 1, da).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
