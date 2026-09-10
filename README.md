# blocks

Personal block tracker. 25-minute focus units logged against goals and projects.
Android only. The source of truth is a real folder on disk (pick it in Settings),
so it can be synced with Syncthing.

## Data folder

On first launch you're sent to Settings to pick a folder via the Android system
picker (Storage Access Framework). The app creates `projects/`, `goals/` and
`blocks/` inside it, one JSON file per entity. Point Syncthing at the same folder
to sync between devices. The app re-scans the folder on every foreground.

## Develop

Needs Node 22+, the Android SDK, and a connected device or emulator. A
**development build** is required (not Expo Go) for notifications and audio.

```
just dev        # Metro dev server
just run        # prebuild + debug dev build on device
just reinstall  # release build, install + launch on device
just apk        # release APK only
just test       # pure-function tests
npm run lint
npx tsc --noEmit
```

Icons are generated from `icons/` by `node scripts/gen-icons.mjs` into
`assets/icon/` (committed). The completion chime is `assets/sounds/chime.wav`.
