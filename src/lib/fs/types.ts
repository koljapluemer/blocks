export type DirEntry = { name: string; isFile: boolean };

/**
 * A directory of JSON files with per-model subfolders. Paths are always
 * POSIX-ish and relative to the data root (`projects`, `projects/foo-ab12cd.json`).
 * The backend maps them to whatever the platform actually uses (SAF `content://`
 * document URIs on Android).
 */
export interface FsBackend {
  /** True once a data root has been chosen and is usable. */
  isConfigured(): boolean;
  /** Opens the platform folder picker. Returns an opaque root handle, or null if cancelled. */
  requestFolder(): Promise<string | null>;
  getRoot(): string | null;
  /** Persist the root and ensure the model subfolders exist. */
  setRoot(root: string): Promise<void>;

  listDir(relDir: string): Promise<DirEntry[]>;
  readFile(relPath: string): Promise<string | null>;
  writeFile(relPath: string, contents: string): Promise<void>;
  deleteFile(relPath: string): Promise<void>;
  ensureDir(relDir: string): Promise<void>;
}
