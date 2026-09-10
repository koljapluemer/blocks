export const MODEL_DIRS = {
  project: 'projects',
  goal: 'goals',
  block: 'blocks',
} as const;

export type ModelKind = keyof typeof MODEL_DIRS;

export const MODEL_DIR_LIST = Object.values(MODEL_DIRS);

/** A Syncthing conflict copy, e.g. `foo.sync-conflict-20240101-120000-ABCDEFG.json` — never load these. */
export function isSyncConflict(name: string): boolean {
  return name.includes('.sync-conflict');
}

export function isModelFile(name: string): boolean {
  return name.toLowerCase().endsWith('.json') && !isSyncConflict(name);
}
