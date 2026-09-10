import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { useToast } from '@/components/ui/toast';
import { projectForGoal } from '@/lib/models/derive';
import { useData } from '@/lib/store/StoreProvider';

import { kvGet, kvSet } from '../fs/kv';
import { chimeIfForeground } from './chimeGate';
import { BLOCK_MS } from './constants';
import { cancelBlockDone, scheduleBlockDone } from './notifications';

export type TimerState =
  | { phase: 'unstarted'; goal: string; visualized: boolean }
  | { phase: 'started'; goal: string; project: string; startedAt: number; endAt: number }
  | { phase: 'evaluate'; goal: string; project: string; startedAt: number; count: boolean | null };

type TimerValue = {
  state: TimerState;
  setGoal: (goal: string) => void;
  markVisualized: () => void;
  start: () => void;
  abort: () => void;
  setCount: (count: boolean) => void;
  doAnother: () => void;
  newGoal: () => void;
};

const TimerContext = createContext<TimerValue | null>(null);

export function useTimer(): TimerValue {
  const v = useContext(TimerContext);
  if (!v) throw new Error('useTimer must be used within StoreProvider');
  return v;
}

const INITIAL: TimerState = { phase: 'unstarted', goal: '', visualized: false };

/** Restore a block that was running (or awaiting evaluation) when the app was last closed. */
function resumeFromKv(): TimerState {
  const p = kvGet('timer') as TimerState | undefined;
  if (!p || typeof p !== 'object') return INITIAL;
  if (p.phase === 'started') {
    if (Date.now() < p.endAt) return p;
    return { phase: 'evaluate', goal: p.goal, project: p.project, startedAt: p.startedAt, count: null };
  }
  if (p.phase === 'evaluate') return { ...p, count: p.count ?? null };
  return INITIAL;
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const { projects, appendBlock } = useData();
  const { showToast } = useToast();

  const [state, setState] = useState<TimerState>(resumeFromKv);
  const stateRef = useRef(state);
  stateRef.current = state;

  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  const resolveProject = useCallback(
    (goal: string) => projectForGoal(projectsRef.current, goal)?.title ?? '',
    [],
  );

  const saveBlock = useCallback(
    (startedAt: number, goal: string, project: string, isClean: boolean) => {
      void appendBlock({ started: new Date(startedAt).toISOString(), goal, project, isClean });
    },
    [appendBlock],
  );

  const beginBlock = useCallback(
    (goal: string): TimerState => {
      const startedAt = Date.now();
      return {
        phase: 'started',
        goal,
        project: resolveProject(goal),
        startedAt,
        endAt: startedAt + BLOCK_MS,
      };
    },
    [resolveProject],
  );

  const setGoal = useCallback((goal: string) => {
    setState((s) => (s.phase === 'unstarted' ? { ...s, goal, visualized: false } : s));
  }, []);

  const markVisualized = useCallback(() => {
    setState((s) => (s.phase === 'unstarted' ? { ...s, visualized: true } : s));
  }, []);

  const start = useCallback(() => {
    setState((s) =>
      s.phase === 'unstarted' && s.visualized && s.goal.trim() ? beginBlock(s.goal.trim()) : s,
    );
  }, [beginBlock]);

  const abort = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'started') return s;
      saveBlock(s.startedAt, s.goal, s.project, false);
      showToast('Block aborted');
      return { phase: 'unstarted', goal: s.goal, visualized: false };
    });
  }, [saveBlock, showToast]);

  const complete = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'started') return s;
      void chimeIfForeground();
      return { phase: 'evaluate', goal: s.goal, project: s.project, startedAt: s.startedAt, count: null };
    });
  }, []);

  const setCount = useCallback((count: boolean) => {
    setState((s) => (s.phase === 'evaluate' ? { ...s, count } : s));
  }, []);

  const doAnother = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'evaluate' || s.count === null) return s;
      saveBlock(s.startedAt, s.goal, s.project, s.count);
      return beginBlock(s.goal);
    });
  }, [saveBlock, beginBlock]);

  const newGoal = useCallback(() => {
    setState((s) => {
      if (s.phase !== 'evaluate' || s.count === null) return s;
      saveBlock(s.startedAt, s.goal, s.project, s.count);
      return { phase: 'unstarted', goal: '', visualized: false };
    });
  }, [saveBlock]);

  // Persist transient timer state to the sandbox (never the synced data folder).
  useEffect(() => {
    kvSet('timer', state.phase === 'unstarted' ? undefined : state);
  }, [state]);

  // While a block runs: schedule the backgrounded alert, and drive completion
  // via a timeout + a foreground re-check (a suspended JS timer may not fire).
  useEffect(() => {
    if (state.phase !== 'started') return;
    const { endAt, goal } = state;
    let disposed = false;
    let notifId: string | null = null;

    void scheduleBlockDone(endAt, goal).then((id) => {
      if (disposed) void cancelBlockDone(id);
      else notifId = id;
    });

    const tick = () => {
      if (stateRef.current.phase === 'started' && Date.now() >= stateRef.current.endAt) complete();
    };
    const timeout = setTimeout(tick, Math.max(0, endAt - Date.now()));
    const sub = AppState.addEventListener('change', (a) => {
      if (a === 'active') tick();
    });

    return () => {
      disposed = true;
      clearTimeout(timeout);
      sub.remove();
      void cancelBlockDone(notifId);
    };
  }, [state, complete]);

  const value = useMemo<TimerValue>(
    () => ({ state, setGoal, markVisualized, start, abort, setCount, doAnother, newGoal }),
    [state, setGoal, markVisualized, start, abort, setCount, doAnother, newGoal],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}
