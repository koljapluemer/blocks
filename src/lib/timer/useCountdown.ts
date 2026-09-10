import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { FINE_COUNTDOWN_MS } from './constants';

export type Countdown = { msLeft: number; label: string; done: boolean };

function labelFor(msLeft: number): string {
  if (msLeft > FINE_COUNTDOWN_MS) return `${Math.ceil(msLeft / 60_000)}m`;
  const total = Math.max(0, Math.ceil(msLeft / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Drift-free countdown to an absolute `endAt` (epoch ms). The interval only
 * triggers a re-read of the wall clock — elapsed time is always `endAt - now`,
 * never accumulated — and the clock is re-read immediately on foreground.
 */
export function useCountdown(endAt: number | null): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endAt == null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [endAt]);

  if (endAt == null) return { msLeft: 0, label: '', done: false };
  const msLeft = Math.max(0, endAt - now);
  return { msLeft, label: labelFor(msLeft), done: msLeft <= 0 };
}
