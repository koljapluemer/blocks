import assert from 'node:assert/strict';
import { test } from 'node:test';

import { blockColor, blockHue, hashString } from '../src/lib/models/color';

test('hashString is deterministic', () => {
  assert.equal(hashString('deep work'), hashString('deep work'));
  assert.notEqual(hashString('deep work'), hashString('shallow work'));
});

test('blockHue is in [0, 360)', () => {
  for (const g of ['a', 'writing', 'ship the thing', '', '🟥']) {
    const h = blockHue(g);
    assert.ok(h >= 0 && h < 360, `${g} -> ${h}`);
  }
});

test('blockColor holds saturation and lightness fixed', () => {
  assert.match(blockColor('anything'), /^hsl\(\d{1,3}, 62%, 55%\)$/);
});

test('blockColor is stable for the same goal', () => {
  assert.equal(blockColor('research'), blockColor('research'));
});
