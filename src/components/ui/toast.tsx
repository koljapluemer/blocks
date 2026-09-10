import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInteractions } from '@/lib/store/InteractionContext';

const AUTO_COMMIT_MS = 20_000;
const INFO_DISMISS_MS = 4_000;
const COMMIT_ON_BUMPS = 2;

type UndoOpts = { onCommit: () => void | Promise<void>; onUndo: () => void };

type ToastValue = {
  showToast: (message: string) => void;
  showUndo: (message: string, opts: UndoOpts) => void;
};

const ToastContext = createContext<ToastValue | null>(null);

export function useToast(): ToastValue {
  const v = useContext(ToastContext);
  if (!v) throw new Error('useToast must be used within StoreProvider');
  return v;
}

type Visible = { id: number; message: string; undo: boolean };

type Active = {
  id: number;
  committed: boolean;
  undo?: UndoOpts;
  bumps: number;
  timer: ReturnType<typeof setTimeout> | null;
  unsub: (() => void) | null;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const { subscribe } = useInteractions();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState<Visible | null>(null);
  const activeRef = useRef<Active | null>(null);
  const counter = useRef(0);

  const clearActive = useCallback(() => {
    const a = activeRef.current;
    if (a?.timer) clearTimeout(a.timer);
    if (a?.unsub) a.unsub();
    activeRef.current = null;
  }, []);

  const commitActive = useCallback(() => {
    const a = activeRef.current;
    if (!a) return;
    if (a.undo && !a.committed) {
      a.committed = true;
      Promise.resolve(a.undo.onCommit()).catch(() => {});
    }
    clearActive();
    setVisible(null);
  }, [clearActive]);

  const showToast = useCallback(
    (message: string) => {
      commitActive();
      const id = ++counter.current;
      activeRef.current = {
        id,
        committed: true,
        bumps: 0,
        unsub: null,
        timer: setTimeout(() => {
          clearActive();
          setVisible(null);
        }, INFO_DISMISS_MS),
      };
      setVisible({ id, message, undo: false });
    },
    [commitActive, clearActive],
  );

  const showUndo = useCallback(
    (message: string, opts: UndoOpts) => {
      commitActive();
      const id = ++counter.current;
      const a: Active = {
        id,
        committed: false,
        undo: opts,
        bumps: 0,
        timer: setTimeout(() => commitActive(), AUTO_COMMIT_MS),
        unsub: null,
      };
      a.unsub = subscribe(() => {
        const cur = activeRef.current;
        if (!cur || cur.id !== id) return;
        cur.bumps += 1;
        if (cur.bumps >= COMMIT_ON_BUMPS) commitActive();
      });
      activeRef.current = a;
      setVisible({ id, message, undo: true });
    },
    [commitActive, subscribe],
  );

  const onUndoPress = useCallback(() => {
    const a = activeRef.current;
    if (a?.undo) {
      a.committed = true;
      a.undo.onUndo();
    }
    clearActive();
    setVisible(null);
  }, [clearActive]);

  const value = useMemo(() => ({ showToast, showUndo }), [showToast, showUndo]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 16 }}
        className="items-center px-four">
        {visible && (
          <Animated.View
            key={visible.id}
            entering={FadeInDown.duration(160)}
            exiting={FadeOutDown.duration(160)}
            className="w-full max-w-[520px] flex-row items-center justify-between rounded-two bg-text px-four py-three dark:bg-text-dark">
            <Text
              numberOfLines={2}
              className="mr-three flex-1 text-[14px] text-background dark:text-background-dark">
              {visible.message}
            </Text>
            {visible.undo && (
              <Pressable onPress={onUndoPress} hitSlop={8}>
                <Text className="text-[14px] font-bold uppercase text-background dark:text-background-dark">
                  Undo
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}
