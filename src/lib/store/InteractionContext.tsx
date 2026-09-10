import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';

/**
 * A global "meaningful interaction" counter. Undo toasts subscribe to it and
 * finalise themselves after 2 bumps. Bumped by nav changes and primary
 * button / FAB / icon-button presses — not raw touches.
 */
type InteractionValue = {
  bump: () => void;
  subscribe: (cb: () => void) => () => void;
};

const InteractionContext = createContext<InteractionValue | null>(null);

export function useInteractions(): InteractionValue {
  const v = useContext(InteractionContext);
  if (!v) throw new Error('useInteractions must be used within StoreProvider');
  return v;
}

/** Optional variant that no-ops outside a provider (for primitives used in isolation). */
export function useInteractionsOptional(): InteractionValue {
  return useContext(InteractionContext) ?? NOOP;
}

const NOOP: InteractionValue = { bump: () => {}, subscribe: () => () => {} };

export function InteractionProvider({ children }: { children: ReactNode }) {
  const subs = useRef(new Set<() => void>());

  const bump = useCallback(() => {
    subs.current.forEach((cb) => cb());
  }, []);

  const subscribe = useCallback((cb: () => void) => {
    subs.current.add(cb);
    return () => {
      subs.current.delete(cb);
    };
  }, []);

  const value = useMemo(() => ({ bump, subscribe }), [bump, subscribe]);

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}
