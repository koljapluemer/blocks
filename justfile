# blocks — Android only. `run` / `apk` / `reinstall` need the Android SDK and a
# connected device or emulator. Install `just` with: dnf install just

default:
    @just --list

# Start the Metro dev server for a development build.
dev:
    npx expo start --dev-client

# Prebuild native code and run the debug dev build on a connected device.
run:
    npx expo run:android

# Build a release APK (android/app/build/outputs/apk/release/app-release.apk).
apk:
    npx expo prebuild --platform android
    cd android && ./gradlew assembleRelease

# Build the release build and (re)install + launch it on the connected device.
reinstall:
    npx expo run:android --variant release

# Pure-function test suite.
test:
    npm test
