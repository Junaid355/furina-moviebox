# Furina MovieBox — Android Native Wrapper (APK Source)

This directory contains the production Android Studio wrapper project for **Furina MovieBox**.

### Features:
1. **Hardware-Accelerated WebView**: 60fps smooth scrolling, GPU rendering for video stream decoding.
2. **Fullscreen Video & AI Boost**: Full `WebChromeClient` implementation with custom view handling for seamless cinema fullscreen.
3. **Smart Back Button Handling**: Closes open modals (Player, Movie Studio, Download Hub) via history popstate before exiting the app.
4. **Native DownloadManager Integration**: Intercepts video/media download requests and saves directly to the Android `Downloads/` directory with progress notifications.
5. **Pull-to-Refresh**: Swipe down to refresh live streams and catalogs.
6. **Zero Bloat & Safe Permissions**: Requests only `INTERNET` and `ACCESS_NETWORK_STATE`.

### How to Build APK:
1. Open this `android/` folder in **Android Studio**.
2. Let Gradle sync dependencies.
3. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. The generated APK will be located at:
   `app/build/outputs/apk/release/app-release-unsigned.apk`
   or
   `app/build/outputs/apk/debug/app-debug.apk`.
