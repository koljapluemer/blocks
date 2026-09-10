/**
 * Local "block done" notification. This is the mechanism that fires when the app
 * is backgrounded — a scheduled DATE-trigger notification at the block's end.
 * All calls are best-effort: a denied permission or unavailable module must
 * never break the timer (the in-app countdown + foreground re-check still work).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'block-done';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let ready: Promise<boolean> | null = null;

async function ensureReady(): Promise<boolean> {
  if (!ready) {
    ready = (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        const granted =
          status === 'granted'
            ? true
            : (await Notifications.requestPermissionsAsync()).status === 'granted';
        if (!granted) return false;
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: 'Block done',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
          });
        }
        return true;
      } catch {
        return false;
      }
    })();
  }
  return ready;
}

/** Schedule the end-of-block alert. Returns an id to cancel it, or null. */
export async function scheduleBlockDone(endAt: number, goal: string): Promise<string | null> {
  try {
    if (!(await ensureReady())) return null;
    if (endAt <= Date.now()) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'Block done', body: goal || 'Time is up', sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(endAt),
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelBlockDone(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ignore
  }
}
