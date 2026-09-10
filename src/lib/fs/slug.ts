/**
 * OS-safe slugged filenames. Ported from the Flutter reference (../note):
 * lowercase, collapse every run of non-[a-z0-9] to a single '-', trim dashes,
 * cap length, then append a short random hex suffix so two entities that slug
 * identically never collide on a filename.
 */

const MAX_LEN = 40;
const MAX_WORDS = 6;

export function slugify(input: string): string {
  const firstWords = input.trim().split(/\s+/).slice(0, MAX_WORDS).join(' ');
  const dashed = firstWords.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const trimmed = dashed.replace(/^-+|-+$/g, '');
  return trimmed.length > MAX_LEN ? trimmed.slice(0, MAX_LEN) : trimmed;
}

export function randomHex(length = 6): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/** `<slug or 'item'>-<hex>.json` */
export function filenameFor(title: string): string {
  const slug = slugify(title);
  return `${slug || 'item'}-${randomHex(6)}.json`;
}
