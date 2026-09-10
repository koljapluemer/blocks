/**
 * Tiny key-value store: a single JSON file in the app sandbox (Paths.document).
 * Holds the chosen data-root URI and transient timer state — things that must
 * NOT live in the synced data folder. Loaded once at startup into an in-memory
 * cache so the rest of the app can read synchronously; writes persist async.
 *
 * Swapping to @react-native-async-storage/async-storage later only touches this file.
 */
import { File, Paths } from 'expo-file-system';

export type KvShape = {
  dataRootUri?: string;
  timer?: unknown;
};

let cache: KvShape = {};
let loaded = false;

function file(): File {
  return new File(Paths.document, 'blocks-kv.json');
}

export function kvLoad(): KvShape {
  if (loaded) return cache;
  try {
    const f = file();
    if (f.exists) {
      const parsed = JSON.parse(f.textSync());
      if (parsed && typeof parsed === 'object') cache = parsed as KvShape;
    }
  } catch {
    cache = {};
  }
  loaded = true;
  return cache;
}

export function kvGet<K extends keyof KvShape>(key: K): KvShape[K] {
  if (!loaded) kvLoad();
  return cache[key];
}

export function kvSet<K extends keyof KvShape>(key: K, value: KvShape[K]): void {
  if (!loaded) kvLoad();
  if (value === undefined) delete cache[key];
  else cache[key] = value;
  persist();
}

function persist(): void {
  try {
    const f = file();
    if (!f.exists) f.create();
    f.write(JSON.stringify(cache, null, 2));
  } catch {
    // Best-effort: a failed sandbox write is non-fatal (kv is a convenience cache).
  }
}
