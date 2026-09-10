/**
 * Android Storage Access Framework backend. The user grants a directory once via
 * the system picker; the grant is persisted by the OS across restarts. Everything
 * is addressed by `content://` document URIs, which cannot be constructed by
 * string concatenation reliably across OEMs — so we keep an in-memory index of
 * relPath -> URI, populated by directory listings, and always list-before-act.
 *
 * SAF has no atomic rename, so writes to an existing file are a direct overwrite.
 * The tolerant reader (json.ts) keeps a torn write from being fatal.
 */
import * as Legacy from 'expo-file-system/legacy';

import { kvGet, kvSet } from './kv';
import { isModelFile } from './paths';
import type { DirEntry, FsBackend } from './types';

const { StorageAccessFramework: SAF } = Legacy;

let rootUri: string | null = (kvGet('dataRootUri') as string | undefined) ?? null;
const dirUriByRel = new Map<string, string>();
const fileUriByRel = new Map<string, string>();

function resetIndex() {
  dirUriByRel.clear();
  fileUriByRel.clear();
}

/** Last path segment of a SAF document URI, URL-decoded. */
function nameFromUri(uri: string): string {
  const lastSeg = uri.split('/').pop() ?? '';
  const decoded = decodeURIComponent(lastSeg);
  const slash = decoded.lastIndexOf('/');
  return slash >= 0 ? decoded.slice(slash + 1) : decoded;
}

function parentRel(relPath: string): string {
  const i = relPath.lastIndexOf('/');
  return i >= 0 ? relPath.slice(0, i) : '';
}

function baseName(relPath: string): string {
  const i = relPath.lastIndexOf('/');
  return i >= 0 ? relPath.slice(i + 1) : relPath;
}

async function resolveDirUri(relDir: string): Promise<string> {
  if (!rootUri) throw new Error('No data folder set');
  if (relDir === '') return rootUri;
  const cached = dirUriByRel.get(relDir);
  if (cached) return cached;

  // relDir is always a single segment in this app (projects/goals/blocks).
  const children = await SAF.readDirectoryAsync(rootUri);
  for (const uri of children) dirUriByRel.set(nameFromUri(uri), uri);

  const found = dirUriByRel.get(relDir);
  if (found) return found;

  const made = await SAF.makeDirectoryAsync(rootUri, relDir);
  dirUriByRel.set(relDir, made);
  return made;
}

async function indexDir(relDir: string): Promise<DirEntry[]> {
  const dirUri = await resolveDirUri(relDir);
  const children = await SAF.readDirectoryAsync(dirUri);
  const entries: DirEntry[] = [];
  for (const uri of children) {
    const name = nameFromUri(uri);
    const isFile = name.includes('.');
    if (isFile) fileUriByRel.set(`${relDir}/${name}`, uri);
    entries.push({ name, isFile });
  }
  return entries;
}

async function resolveFileUri(relPath: string): Promise<string | null> {
  const cached = fileUriByRel.get(relPath);
  if (cached) return cached;
  await indexDir(parentRel(relPath));
  return fileUriByRel.get(relPath) ?? null;
}

export const safBackend: FsBackend = {
  isConfigured: () => !!rootUri,

  getRoot: () => rootUri,

  async requestFolder() {
    const perm = await SAF.requestDirectoryPermissionsAsync();
    return perm.granted ? perm.directoryUri : null;
  },

  async setRoot(root: string) {
    rootUri = root;
    resetIndex();
    kvSet('dataRootUri', root);
    await this.ensureDir('projects');
    await this.ensureDir('goals');
    await this.ensureDir('blocks');
  },

  async ensureDir(relDir: string) {
    await resolveDirUri(relDir);
  },

  async listDir(relDir: string) {
    const entries = await indexDir(relDir);
    return entries.filter((e) => isModelFile(e.name));
  },

  async readFile(relPath: string) {
    const uri = await resolveFileUri(relPath);
    if (!uri) return null;
    try {
      return await Legacy.readAsStringAsync(uri);
    } catch {
      return null;
    }
  },

  async writeFile(relPath: string, contents: string) {
    const existing = await resolveFileUri(relPath);
    if (existing) {
      await Legacy.writeAsStringAsync(existing, contents);
      return;
    }
    const dir = parentRel(relPath);
    const dirUri = await resolveDirUri(dir);
    const nameNoExt = baseName(relPath).replace(/\.json$/i, '');
    const created = await SAF.createFileAsync(dirUri, nameNoExt, 'application/json');
    fileUriByRel.set(relPath, created);
    await Legacy.writeAsStringAsync(created, contents);
  },

  async deleteFile(relPath: string) {
    const uri = await resolveFileUri(relPath);
    if (!uri) return;
    try {
      await Legacy.deleteAsync(uri, { idempotent: true });
    } finally {
      fileUriByRel.delete(relPath);
    }
  },
};
