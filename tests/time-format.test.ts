import assert from 'node:assert/strict';
import { test } from 'node:test';

import { dayKey, formatDayHeader, formatTimeOfDay } from '../src/lib/time/format';

test('dayKey uses local calendar date, zero-padded', () => {
  const d = new Date(2026, 8, 8, 23, 30); // 8 Sep 2026 local
  assert.equal(dayKey(d.getTime()), '2026-09-08');
  const e = new Date(2026, 0, 3, 0, 5); // 3 Jan 2026 local
  assert.equal(dayKey(e.getTime()), '2026-01-03');
});

test('formatTimeOfDay has no seconds', () => {
  const s = formatTimeOfDay(new Date(2026, 0, 1, 14, 5, 33));
  assert.doesNotMatch(s, /33/);
  assert.match(s, /\d{1,2}[:.]\d{2}/);
});

test('formatDayHeader resolves Today and Yesterday', () => {
  const now = new Date(2026, 8, 8, 12, 0).getTime();
  assert.equal(formatDayHeader('2026-09-08', now), 'Today');
  assert.equal(formatDayHeader('2026-09-07', now), 'Yesterday');
});

test('formatDayHeader falls back to a weekday label', () => {
  const now = new Date(2026, 8, 8, 12, 0).getTime();
  const label = formatDayHeader('2026-09-01', now);
  assert.notEqual(label, 'Today');
  assert.notEqual(label, 'Yesterday');
  assert.ok(label.length > 0);
});
