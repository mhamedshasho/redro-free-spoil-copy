# Redro Food Stock — Android build

The Android package is built from the local web application files. The APK does not load the GitHub Pages website at runtime.

## Build

GitHub Actions workflow: **Android APK**. Run it from Actions or push a change to the configured application paths. The workflow installs the pinned Capacitor major version, bundles the app into `www/`, creates the Android project, syncs native plugins, and builds a debug APK.

## Android compatibility

The workflow sets Android `minSdkVersion` to API 24 (Android 7.0). Every native plugin must remain compatible with API 24 before it is added to the app.

## Updates

A normal APK contains a snapshot of the bundled HTML, CSS, and JavaScript. A service worker alone cannot safely replace the native APK or guarantee delivery of new bundled app code in every Android WebView. JavaScript/CSS live updates need a separately designed, signed update channel with rollback and compatibility checks. Native permission, plugin, or Android changes require a new APK. No remote-code update mechanism is enabled by this foundation.

## Current status

This is build infrastructure, not a verified release. The first workflow run must pass before the APK can be considered buildable. A debug APK is not a signed production release.
