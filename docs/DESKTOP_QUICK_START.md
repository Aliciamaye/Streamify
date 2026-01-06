# Streamify Desktop - Quick Start Guide

## Overview

This guide will help you get started building the desktop executable version of Streamify using Electron. We'll create a native desktop app that runs on Windows, macOS, and Linux.

## Prerequisites

- Node.js 18+ installed
- Basic understanding of Electron
- Current web version running successfully

## Step 1: Install Dependencies

```bash
cd c:\Users\JACOBBB\Desktop\streamify

# Install Electron and build tools
npm install --save-dev electron@^28.0.0 electron-builder@^24.9.1 concurrently@^8.2.2 wait-on@^7.2.0

# Install runtime dependencies
npm install electron-updater@^6.1.7
```

## Step 2: Create Electron Files

### Create `electron/` directory structure:

```
streamify/
├── electron/
│   ├── main.ts          # Main process
│   ├── preload.ts       # IPC bridge
│   ├── tray.ts          # System tray
│   └── tsconfig.json    # TypeScript config for Electron
```

### File: `electron/main.ts`

```typescript
import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, Notification } from 'electron';
import path from 'path';
import { setupTray } from './tray';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true,
    titleBarStyle: 'default',
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup tray
  tray = setupTray(mainWindow);

  // Register media keys
  registerMediaKeys();
}

function registerMediaKeys() {
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('media-key', 'play-pause');
  });

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow?.webContents.send('media-key', 'next');
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow?.webContents.send('media-key', 'previous');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
});

// IPC Handlers
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.hide());

ipcMain.on('notification', (event, { title, body }) => {
  new Notification({ title, body }).show();
});

ipcMain.on('track-changed', (event, track) => {
  tray?.setToolTip(`Streamify - ${track.title} by ${track.artist}`);
});
```

### File: `electron/preload.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Notifications
  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('notification', { title, body });
  },

  // Track updates
  setCurrentTrack: (track: any) => {
    ipcRenderer.send('track-changed', track);
  },

  // Media key listener
  onMediaKey: (callback: (key: string) => void) => {
    ipcRenderer.on('media-key', (event, key) => callback(key));
  },
});
```

### File: `electron/tray.ts`

```typescript
import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron';
import path from 'path';

export function setupTray(mainWindow: BrowserWindow): Tray {
  // Use a simple icon for now (you'll replace with actual icon later)
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const tray = new Tray(nativeImage.createEmpty());

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Streamify',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Play/Pause',
      click: () => {
        mainWindow.webContents.send('media-key', 'play-pause');
      },
    },
    {
      label: 'Next Track',
      click: () => {
        mainWindow.webContents.send('media-key', 'next');
      },
    },
    {
      label: 'Previous Track',
      click: () => {
        mainWindow.webContents.send('media-key', 'previous');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Streamify');

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return tray;
}
```

### File: `electron/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "../dist/electron",
    "target": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node"
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 3: Update Frontend for Electron

### Create: `src/frontend/utils/electron.ts`

```typescript
// Electron detection and API wrapper
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && (window as any).electron !== undefined;
};

export const electronAPI = {
  // Window controls
  minimize: () => {
    if (isElectron()) (window as any).electron.minimize();
  },
  maximize: () => {
    if (isElectron()) (window as any).electron.maximize();
  },
  close: () => {
    if (isElectron()) (window as any).electron.close();
  },

  // Notifications
  sendNotification: (title: string, body: string) => {
    if (isElectron()) {
      (window as any).electron.sendNotification(title, body);
    } else {
      // Fallback for web version
      console.log(`[Notification] ${title}: ${body}`);
    }
  },

  // Track updates
  setCurrentTrack: (track: { title: string; artist: string }) => {
    if (isElectron()) {
      (window as any).electron.setCurrentTrack(track);
    }
  },

  // Media keys
  onMediaKey: (callback: (key: string) => void) => {
    if (isElectron()) {
      (window as any).electron.onMediaKey(callback);
    }
  },
};

// Type declaration
declare global {
  interface Window {
    electron?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      sendNotification: (title: string, body: string) => void;
      setCurrentTrack: (track: any) => void;
      onMediaKey: (callback: (key: string) => void) => void;
    };
  }
}
```

## Step 4: Integrate with Player Context

Update `src/frontend/contexts/PlayerContext.tsx` to add desktop features:

```typescript
// Add this import at the top
import { electronAPI, isElectron } from '../utils/electron';

// Inside PlayerProvider component, add this useEffect:
useEffect(() => {
  // Send notifications when track changes (desktop only)
  if (currentTrack && isElectron()) {
    electronAPI.sendNotification(
      'Now Playing',
      `${currentTrack.title} - ${currentTrack.artist}`
    );
    electronAPI.setCurrentTrack(currentTrack);
  }
}, [currentTrack]);

// Setup media key handlers
useEffect(() => {
  if (isElectron()) {
    electronAPI.onMediaKey((key: string) => {
      switch (key) {
        case 'play-pause':
          togglePlay();
          break;
        case 'next':
          nextTrack();
          break;
        case 'previous':
          prevTrack();
          break;
      }
    });
  }
}, [togglePlay, nextTrack, prevTrack]);
```

## Step 5: Update package.json

Add these scripts and configuration:

```json
{
  "main": "dist/electron/main.js",
  "scripts": {
    "dev": "vite --port 3000 --host",
    "dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build": "vite build",
    "build:electron:code": "tsc -p electron/tsconfig.json",
    "build:electron": "npm run build && npm run build:electron:code && electron-builder",
    "build:win": "npm run build && npm run build:electron:code && electron-builder --win",
    "build:mac": "npm run build && npm run build:electron:code && electron-builder --mac",
    "build:linux": "npm run build && npm run build:electron:code && electron-builder --linux"
  },
  "build": {
    "appId": "com.streamify.app",
    "productName": "Streamify",
    "directories": {
      "output": "release",
      "buildResources": "assets"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "assets/icon.icns",
      "category": "public.app-category.music"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icon.png",
      "category": "Audio"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

## Step 6: Create App Icons (Placeholder)

For now, create placeholder icons:

1. Create `assets/` folder
2. Add placeholder icons:
   - `assets/icon.ico` (Windows)
   - `assets/icon.icns` (macOS)
   - `assets/icon.png` (Linux, 512x512)
   - `assets/tray-icon.png` (16x16 or 32x32)

You can use online tools to generate these from a logo.

## Step 7: Test Desktop App

### Development Mode

```bash
# Terminal 1: Start backend
cd src/backend
npm run dev

# Terminal 2: Start desktop app
cd ../..
npm run dev:electron
```

The Electron app should open with the Streamify UI!

### Production Build (Windows)

```bash
npm run build:win
```

This will create an installer in `release/` folder.

## Features to Test

✅ **Window controls** - Minimize, maximize, close
✅ **System tray** - App appears in tray when closed
✅ **Media keys** - Keyboard media keys control playback
✅ **Notifications** - Track changes show OS notifications
✅ **All web features** - Search, play, queue, etc.

## Common Issues & Solutions

### Issue: "Cannot find module 'electron'"
**Solution**: Run `npm install --save-dev electron`

### Issue: "ENOENT: no such file or directory, open 'preload.js'"
**Solution**: Compile TypeScript first: `npm run build:electron:code`

### Issue: Backend not connecting
**Solution**: Make sure backend is running on port 5000

### Issue: App doesn't show in tray
**Solution**: Need proper tray icon (16x16 PNG)

## Next Steps

1. ✅ Test basic desktop app
2. Create professional app icons
3. Test on different Windows versions
4. Setup auto-updater (optional)
5. Code signing (optional, requires certificate)
6. Create installers for macOS and Linux

## Distribution

Once built, share the installer from `release/` folder:
- **Windows**: `Streamify-Setup-1.0.0.exe`
- **macOS**: `Streamify-1.0.0.dmg`
- **Linux**: `Streamify-1.0.0.AppImage`

---

**Need Help?** Check the full implementation plan in `implementation_plan.md`
