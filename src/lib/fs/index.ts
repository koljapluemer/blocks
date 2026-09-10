import { safBackend } from './saf';
import type { FsBackend } from './types';

/** The active filesystem backend. Android-only build => always SAF. */
export const fs: FsBackend = safBackend;

export type { DirEntry, FsBackend } from './types';
export { MODEL_DIRS } from './paths';
export { filenameFor, slugify } from './slug';
export { parseModelFile, stringifyModel } from './json';
export { kvLoad, kvGet, kvSet } from './kv';
