/**
 * Tolerant JSON I/O for on-disk model files. A file that isn't valid JSON, or
 * isn't a JSON object, is skipped rather than fatal (Syncthing may drop a
 * half-synced or conflicted file into the folder at any time).
 */

export function parseModelFile(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Serialise a model, emitting `known` keys in a fixed order first, then any
 * extra keys the app doesn't own (round-tripped verbatim so external tooling's
 * metadata survives). 2-space indent for readable Syncthing diffs.
 */
export function stringifyModel(
  known: Record<string, unknown>,
  passthrough?: Record<string, unknown>,
): string {
  const out: Record<string, unknown> = { ...known };
  if (passthrough) {
    for (const [k, v] of Object.entries(passthrough)) {
      if (!(k in out)) out[k] = v;
    }
  }
  return JSON.stringify(out, null, 2) + '\n';
}
