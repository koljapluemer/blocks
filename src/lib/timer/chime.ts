/**
 * Foreground completion chime. The backgrounded case is covered by the
 * notification sound (notifications.ts); this is just the cue when the app is
 * open. Uses expo-audio's imperative player so it can outlive any component.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const CHIME = require('@/assets/sounds/chime.wav');

let player: AudioPlayer | null = null;
let unavailable = false;

export async function playChime(): Promise<void> {
  if (unavailable) return;
  try {
    if (!player) {
      player = createAudioPlayer(CHIME);
      await setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    }
    player.seekTo(0);
    player.play();
  } catch {
    unavailable = true;
  }
}
