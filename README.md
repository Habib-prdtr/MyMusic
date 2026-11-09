# MyMusic

PulseMusic / SoundLocal - Modern Offline Local Music Player for Android built with React Native and Expo.

## 🎵 Features

- **Zero-Setup & 100% Offline**: Automatically detects and indexes local audio files without an internet connection or external server database.
- **Background Audio Engine**: Stays active in background, includes lockscreen & notification controls, and handles audio interruptions/focus.
- **Organized Library**:
  - **Tracks**: Virtualized 60 FPS list with instant search, pull-to-refresh, and sorting (A-Z, Artist, Date Added, Duration).
  - **Artists**: Grouped by artist with quick play and track viewer.
  - **Albums**: Grid layout of albums with track counts.
  - **Playlists**: Favorites hero tile and custom user playlists (Create, Add, Delete, Play All).
- **Floating Mini Player**: Seamless playback bar above navigation tabs.
- **Now Playing Full-Screen Modal**: Vinyl disc artwork, interactive seek slider, shuffle, loop single / loop all, and queue manager.
- **Privacy First**: Granular media access permissions (`READ_MEDIA_AUDIO` on Android 13+, `READ_EXTERNAL_STORAGE` on Android 12-).

## 🛠 Tech Stack

- **Framework**: React Native 0.88, Expo SDK 58 (TypeScript)
- **State Management**: Zustand
- **Local Key-Value Storage**: `@react-native-async-storage/async-storage`
- **Audio Engine**: `expo-audio` & `expo-av`
- **Media Scanner**: `expo-media-library` (Android OS MediaStore ContentResolver)
- **High Performance Virtualization**: `@shopify/flash-list`
- **Icons & Styling**: `lucide-react-native`, `react-native-svg`

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Android SDK & Java JDK (v17+)

### Installation
```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start

# Run on connected Android device or emulator
npx expo run:android
```
