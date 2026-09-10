import { Redirect, usePathname } from 'expo-router';
import type { ReactNode } from 'react';

import { useFolder } from './StoreProvider';

/** Until a data folder is chosen, only Settings is reachable. */
export function FolderGate({ children }: { children: ReactNode }) {
  const { isConfigured } = useFolder();
  const pathname = usePathname();

  if (!isConfigured && pathname !== '/settings') {
    return <Redirect href="/settings" />;
  }
  return <>{children}</>;
}
