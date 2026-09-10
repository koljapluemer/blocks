import assert from 'node:assert/strict';
import { test } from 'node:test';

import { filenameFor, slugify } from '../src/lib/fs/slug';

test('slugify lowercases and dashes non-alphanumerics', () => {
  assert.equal(slugify('Buy Milk & Eggs!'), 'buy-milk-eggs');
});

test('slugify trims leading/trailing dashes', () => {
  assert.equal(slugify('  ...hello... '), 'hello');
});

test('slugify caps at 6 words', () => {
  assert.equal(slugify('one two three four five six seven eight'), 'one-two-three-four-five-six');
});

test('slugify caps length at 40 chars', () => {
  const s = slugify('a'.repeat(80));
  assert.equal(s.length, 40);
});

test('slugify returns empty for non-ascii-only input', () => {
  assert.equal(slugify('日本語のみ'), '');
});

test('filenameFor appends 6 hex chars and .json', () => {
  const name = filenameFor('Hello World');
  assert.match(name, /^hello-world-[0-9a-f]{6}\.json$/);
});

test('filenameFor falls back to item when slug empty', () => {
  assert.match(filenameFor('!!!'), /^item-[0-9a-f]{6}\.json$/);
});
