import { AppState } from 'react-native';

import { playChime } from './chime';

/** Play the chime only when the app is in the foreground (backgrounded => the notification sound plays). */
export async function chimeIfForeground(): Promise<void> {
  if (AppState.currentState === 'active') await playChime();
}
