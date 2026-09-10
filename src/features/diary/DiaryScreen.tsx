import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import type { Block, FileBacked } from '@/lib/models/types';
import { BLOCK_MS } from '@/lib/timer/constants';
import { dayKey, formatDayHeader, formatTimeOfDay } from '@/lib/time/format';
import { useData } from '@/lib/store/StoreProvider';

import { DayRow } from './DayRow';

type Day = { key: string; label: string; blocks: FileBacked<Block>[] };

function groupByDay(blocks: FileBacked<Block>[]): Day[] {
  const byKey = new Map<string, FileBacked<Block>[]>();
  for (const b of blocks) {
    const t = Date.parse(b.started);
    if (Number.isNaN(t)) continue;
    const key = dayKey(t);
    const list = byKey.get(key);
    if (list) list.push(b);
    else byKey.set(key, [b]);
  }
  return [...byKey.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => ({
      key,
      label: formatDayHeader(key),
      blocks: list.sort((x, y) => Date.parse(x.started) - Date.parse(y.started)),
    }));
}

function detailLine(b: FileBacked<Block>): string {
  const start = Date.parse(b.started);
  const range = `${formatTimeOfDay(start)}–${formatTimeOfDay(start + BLOCK_MS)}`;
  const parts = [range, b.project || '—', b.goal || '—'];
  if (!b.isClean) parts.push("didn't count");
  return parts.join('  ·  ');
}

export function DiaryScreen() {
  const { blocks } = useData();
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const days = useMemo(() => groupByDay(blocks), [blocks]);
  const active = useMemo(
    () => blocks.find((b) => b.__file === activeFile) ?? null,
    [blocks, activeFile],
  );

  return (
    <Screen scroll>
      <ThemedText type="subtitle">Diary</ThemedText>

      <ThemedText type="small" themeColor="textSecondary" className="mt-two h-5">
        {active ? detailLine(active) : blocks.length ? 'Tap a block for details.' : ''}
      </ThemedText>

      {days.length === 0 ? (
        <ThemedText themeColor="textSecondary" className="mt-four">
          No blocks yet.
        </ThemedText>
      ) : (
        <View className="mt-two">
          {days.map((d) => (
            <DayRow
              key={d.key}
              label={d.label}
              blocks={d.blocks}
              activeFile={activeFile}
              onSelect={(b) => setActiveFile((cur) => (cur === b.__file ? null : b.__file))}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
