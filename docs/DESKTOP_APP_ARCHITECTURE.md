# Streamify Desktop Application - Technical Architecture

## Overview

Streamify Desktop is an Electron-based desktop application that wraps the existing React frontend with native OS capabilities. It shares 100% of the codebase with the web version while adding desktop-specific enhancements.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Streamify Desktop App                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Electron Main Process                    │   │
│  │  - Window Management                                  │   │
│  │  - System Tray                                        │   │
│  │  - Media Keys                                         │   │
│  │  - Auto Updater                                       │   │
│  │  - Backend Server Runner (embedded)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                     │
│                         │ IPC Bridge (preload.ts)            │
│                         ▼                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Electron Renderer Process                   │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │     React Frontend (src/frontend/)             │  │   │
│  │  │  - Components                                  │  │   │
│  │  │  - Contexts (Auth, Player, Theme)              │  │   │
│  │  │  - API Client                                  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                     │
│                         │ HTTP API                            │
│                         ▼                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Express Backend (src/backend/)                   │   │
│  │  - YouTube Music Service                             │   │
│  │  - Auth Service                                       │   │
│  │  - API Routes                                         │   │
│  │  - Caching Layer                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ External APIs
                         ▼
              ┌──────────────────────┐
              │   YouTube Music API   │
              └──────────────────────┘
```

## Process Architecture

### Main Process (Node.js)
- **Responsibilities**: 
  - Create and manage BrowserWindow
  - Handle system-level operations (tray, notifications, media keys)
  - Run embedded Express backend server
  - Manage app lifecycle

- **Key Files**:
  - `electron/main.ts` - Entry point
  - `electron/tray.ts` - System tray manager
  - `electron/updater.ts` - Auto-update logic
  - `electron/backend-server.ts` - Backend server runner

### Renderer Process (Chromium)
- **Responsibilities**:
  - Render React UI
  - Handle user interactions
  - Communicate with backend via HTTP
  - Communicate with main process via IPC

- **Key Files**:
  - All files in `src/frontend/`
  - `electron/preload.ts` - Secure IPC bridge

## IPC Communication

### Main → Renderer
```typescript
// Track change notification
window.postMessage('track-changed', trackData);

// Update download progress
window.postMessage('update-progress', { percent: 50 });
```

### Renderer → Main
```typescript
// Via preload bridge
window.electron.minimize();
window.electron.sendNotification(title, body);
window.electron.registerMediaKeyHandler('play-pause', callback);
```

## Desktop Features

### 1. System Tray Integration
- **Icon**: Custom tray icon (assets/tray-icon.png)
- **Context Menu**:
  - Show/Hide Window
  - Play/Pause
  - Next Track
  - Previous Track
  - Quit Application
- **Click Behavior**: Toggle window visibility

### 2. Media Keys Support
- **Supported Keys**:
  - Play/Pause
  - Next Track
  - Previous Track
  - Stop
- **Implementation**: `globalShortcut.register()` in main process
- **Platform Coverage**: Windows, macOS, Linux

### 3. System Notifications
- **Triggers**:
  - Track change
  - Download complete
  - Update available
- **Implementation**: `Notification` API in main process
- **Platform Native**: Uses OS notification center

### 4. Auto-Updates
- **Library**: electron-updater
- **Update Server**: GitHub Releases (recommended)
- **Flow**:
  1. Check for updates on startup
  2. Download in background
  3. Show notification when ready
  4. Install on next launch

### 5. Offline Mode
- **Cache Storage**: Local IndexedDB (existing)
- **Enhanced Limits**: No browser quota restrictions
- **Strategy**: Cache recently played tracks automatically

## Build Configuration

### Development
```bash
npm run dev:electron
```
- Starts Vite dev server on port 3000
- Launches Electron in development mode
- Hot reload enabled for React code
- Backend runs on port 5000

### Production Build
```bash
npm run build:electron
```
1. Vite builds frontend → `dist/`
2. TypeScript compiles Electron code → `electron/*.js`
3. electron-builder packages everything → `release/`

### Platform-Specific Builds
```bash
npm run build:win    # .exe + portable
npm run build:mac    # .dmg + .zip
npm run build:linux  # .AppImage + .deb
```

## File Structure (After Implementation)

```
streamify/
├── electron/                    # Desktop-specific code
│   ├── main.ts                 # Main process entry
│   ├── preload.ts              # IPC bridge
│   ├── tray.ts                 # System tray
│   ├── updater.ts              # Auto-updater
│   └── backend-server.ts       # Backend runner
│
├── src/
│   ├── frontend/               # Shared React code
│   │   ├── utils/
│   │   │   └── electron.ts     # Electron detection/wrapper
│   │   ├── contexts/
│   │   │   └── PlayerContext.tsx  # Enhanced with media keys
│   │   └── ...
│   │
│   └── backend/                # Express API
│       └── ...
│
├── assets/                      # Desktop assets
│   ├── icon.ico                # Windows icon
│   ├── icon.icns               # macOS icon
│   ├── icon.png                # Linux icon
│   └── tray-icon.png           # System tray icon
│
├── dist/                        # Build output
└── release/                     # Final installers
    ├── Streamify-Setup-1.0.0.exe
    ├── Streamify-1.0.0.dmg
    └── Streamify-1.0.0.AppImage
```

## Shared Codebase Strategy

### Detection Pattern
```typescript
// src/frontend/utils/electron.ts
export const isElectron = () => {
  return window.electron !== undefined;
};

// Usage in components
if (isElectron()) {
  // Use desktop-specific feature
  window.electron.sendNotification(title, body);
} else {
  // Use web fallback
  console.log(`Now playing: ${title}`);
}
```

### Conditional Features
- **Notifications**: Desktop → Native, Web → None/Web Notifications API
- **Media Keys**: Desktop → Global shortcuts, Web → Media Session API
- **Tray**: Desktop → System tray, Web → N/A
- **Auto-Update**: Desktop → electron-updater, Web → Service Worker

## Security Considerations

### Context Isolation
- ✅ `contextIsolation: true` - Renderer cannot access Node.js
- ✅ `nodeIntegration: false` - Enhanced security
- ✅ Preload script as only bridge

### IPC Security
```typescript
// ❌ BAD: exposing entire IPC
contextBridge.exposeInMainWorld('electron', ipcRenderer);

// ✅ GOOD: exposing specific safe methods
contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window-minimize'),
  sendNotification: (title, body) => ipcRenderer.send('notification', { title, body })
});
```

### Backend Security
- Backend runs only on localhost
- No external network access
- Same JWT authentication as web version

## Performance Optimizations

### Memory Management
- Close DevTools in production
- Limit cache size
- Handle window close (hide instead of destroy for faster reopen)

### Startup Time
- Lazy load non-critical modules
- Preload frequently used data
- Background backend startup

### Bundle Size
- Use ASAR archive (compression)
- Exclude dev dependencies
- Platform-specific builds (don't bundle all platforms)

## Platform-Specific Considerations

### Windows
- **Installer**: NSIS (installer) + Portable (no install)
- **Auto-Update**: Works seamlessly
- **Code Signing**: Optional but recommended (avoid SmartScreen warning)
- **Shortcuts**: Start Menu + Desktop

### macOS
- **Installer**: DMG (drag-to-Applications)
- **Code Signing**: Required for distribution outside App Store
- **Notarization**: Required for macOS 10.15+
- **Shortcuts**: Applications folder

### Linux
- **Formats**: AppImage (universal), .deb (Debian/Ubuntu)
- **Auto-Update**: AppImages support updates
- **Desktop Entry**: Auto-created for .deb

## Distribution Channels

### GitHub Releases (Recommended)
- Free hosting
- electron-updater integration
- Version management
- Download analytics

### Direct Download
- Host on own server
- Custom update server
- More control

### App Stores (Future)
- Microsoft Store (Windows)
- Mac App Store (macOS)
- Snap Store (Linux)

## Maintenance

### Version Updates
1. Update `version` in package.json
2. Build all platforms: `npm run build:electron`
3. Upload to GitHub Releases
4. Users auto-update on next launch

### Bug Fixes
- Fix code in shared codebase
- Rebuild and publish new version
- Auto-updater distributes fix

## FAQ

**Q: Why Electron instead of Tauri or Flutter?**
A: Electron lets us reuse 100% of existing React code. Tauri would require Rust, Flutter would require complete rewrite.

**Q: Why is the file size so large?**
A: Electron bundles Chromium (~100MB) and Node.js runtime. This is normal and accepted for desktop apps.

**Q: Can I remove the web version?**
A: No, both versions share the same codebase. The desktop version is the web version + Electron wrapper.

**Q: Do I need to run the backend separately?**
A: No (with Option A). The desktop app bundles and auto-starts the backend server.

**Q: How do updates work?**
A: electron-updater checks GitHub Releases on startup, downloads updates in background, installs on next launch.

---

**Ready for implementation!** See `implementation_plan.md` for step-by-step guide.
