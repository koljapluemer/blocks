import { filenameFor } from '../fs/slug';
import { parseModelFile, stringifyModel } from '../fs/json';
import type { FsBackend } from '../fs/types';
import type { FileBacked, Passthrough } from '../models/types';

export type Codec<T> = {
  /** Parse a raw JSON object into a model, or return null to skip the file. */
  fromJson(raw: Record<string, unknown>): T | null;
  /** Owned keys the app regenerates on write (everything else is passthrough). */
  ownedKeys: string[];
  /** Serialise the owned fields (passthrough is merged in by the caller). */
  toJson(model: T): Record<string, unknown>;
  /** Title used to derive a filename on create. */
  titleOf(model: T): string;
};

export function collectPassthrough(
  raw: Record<string, unknown>,
  ownedKeys: string[],
): Passthrough | undefined {
  const owned = new Set(ownedKeys);
  const extra: Passthrough = {};
  let has = false;
  for (const [k, v] of Object.entries(raw)) {
    if (!owned.has(k) && k !== '__passthrough') {
      extra[k] = v;
      has = true;
    }
  }
  return has ? extra : undefined;
}

export async function loadAll<T>(
  fs: FsBackend,
  dir: string,
  codec: Codec<T>,
): Promise<FileBacked<T>[]> {
  const entries = await fs.listDir(dir);
  const out: FileBacked<T>[] = [];
  for (const entry of entries) {
    const relPath = `${dir}/${entry.name}`;
    const text = await fs.readFile(relPath);
    if (text == null) continue;
    const raw = parseModelFile(text);
    if (!raw) continue;
    const model = codec.fromJson(raw);
    if (!model) continue;
    out.push({ ...(model as T), __file: relPath } as FileBacked<T>);
  }
  return out;
}

function serialise<T>(codec: Codec<T>, model: T): string {
  const known = codec.toJson(model);
  const passthrough = (model as { __passthrough?: Passthrough }).__passthrough;
  return stringifyModel(known, passthrough);
}

export async function create<T>(
  fs: FsBackend,
  dir: string,
  codec: Codec<T>,
  data: T,
): Promise<FileBacked<T>> {
  const relPath = `${dir}/${filenameFor(codec.titleOf(data))}`;
  await fs.writeFile(relPath, serialise(codec, data));
  return { ...(data as T), __file: relPath } as FileBacked<T>;
}

export async function update<T>(
  fs: FsBackend,
  codec: Codec<T>,
  model: FileBacked<T>,
): Promise<void> {
  await fs.writeFile(model.__file, serialise(codec, model));
}

/** Re-create a file at a known relPath (used to restore an undone delete). */
export async function writeAt<T>(
  fs: FsBackend,
  codec: Codec<T>,
  relPath: string,
  data: T,
): Promise<FileBacked<T>> {
  await fs.writeFile(relPath, serialise(codec, data));
  return { ...(data as T), __file: relPath } as FileBacked<T>;
}

export async function remove(fs: FsBackend, relPath: string): Promise<void> {
  await fs.deleteFile(relPath);
}

// --- small tolerant coercion helpers shared by codecs ---

export const asString = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

export const asBool = (v: unknown, fallback = false): boolean =>
  typeof v === 'boolean' ? v : fallback;

export const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
