#!/usr/bin/env node
/**
 * Regenerates the app icons under assets/icon/ from the source graphic in icons/.
 *
 * Source: icons/android-chrome-512x512.png — a full-bleed brand-red (#DD2E44) square
 * (Twemoji 1f7e5, CC-BY 4.0; see icons/about.txt).
 *
 * Outputs (committed to the repo so the Android build never depends on this script):
 *   assets/icon/icon.png              1024x1024 solid red — expo.icon
 *   assets/icon/adaptive-icon.png     1024x1024 solid red — expo.android.adaptiveIcon.foregroundImage
 *   assets/icon/notification-icon.png 96x96 white square on transparent — expo-notifications plugin icon
 *
 * Requires ImageMagick (`magick`). Run: node scripts/gen-icons.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'icons', 'android-chrome-512x512.png');
const outDir = join(root, 'assets', 'icon');
const RED = '#DD2E44';

mkdirSync(outDir, { recursive: true });

const run = (args) => execFileSync('magick', args, { stdio: 'inherit' });

// Solid red 1024 square for the launcher icon and adaptive foreground.
for (const name of ['icon.png', 'adaptive-icon.png']) {
  run([src, '-resize', '1024x1024', '-background', RED, '-alpha', 'remove', '-alpha', 'off', join(outDir, name)]);
}

// Notification icon: white silhouette on transparent, centered in a 96px canvas.
run([
  src,
  '-resize', '72x72',
  '-fill', 'white', '-colorize', '100',
  '-background', 'none', '-gravity', 'center', '-extent', '96x96',
  join(outDir, 'notification-icon.png'),
]);

console.log('Wrote', outDir);
