# Streamify Desktop App - Electron Implementation Guide

## 🎯 Goal
Convert Streamify into a cross-platform desktop application using Electron, enabling distribution without hosting costs and providing better legal protection.

---

## 📦 Installation & Setup

### Step 1: Install Electron Dependencies

```bash
cd streamify

# Install Electron and build tools
npm install --save-dev electron electron-builder concurrently wait-on cross-env

# Install Electron-specific packages
npm install electron-store better-sqlite3

# Optional: System integration
npm install node-notifier  # Native notifications
```

### Step 2: Create Electron Files Structure

```
streamify/
├── electron/
│   ├── main.js              # Main process (backend + window)
│   ├── preload.js           # Secure IPC bridge
│   ├── menu.js              # Native menus
│   └── icon.png             # App icon
├── src/
│   ├── backend/             # Existing backend (will run in main process)
│   └── frontend/            # Existing frontend (will run in renderer)
├── package.json             # Update with Electron scripts
└── electron-builder.json    # Build configuration
```

---

## 📄 File Contents

### 1. `electron/main.js`

\`\`\`javascript
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const Store = require('electron-store');

// Initialize electron-store for persistent settings
const store = new Store();

let mainWindow;
let tray;
let backendServer;

// Start Express backend in main process
function startBackend() {
  // Import your existing backend
  const backend = require('../src/backend/server');
  const PORT = process.env.PORT || 3001;
  
  console.log(\`Backend running on http://localhost:\${PORT}\`);
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Streamify',
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  // Load the frontend
  const startUrl = isDev
    ? 'http://localhost:3000'  // Dev server
    : \`file://\${path.join(__dirname, '../build/index.html')}\`;  // Production build

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Prevent title changes
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  // Minimize to tray
  mainWindow.on('close', (event) => {
    if (!app.isQuitting && store.get('minimizeToTray', true)) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create system tray
  createTray();

  // Create native menus
  createMenu();
}

// System tray
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Streamify', click: () => mainWindow.show() },
    { label: 'Play/Pause', click: () => mainWindow.webContents.send('toggle-play') },
    { label: 'Next Track', click: () => mainWindow.webContents.send('next-track') },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Streamify');

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Native menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => mainWindow.webContents.send('navigate', '/settings')
        },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { app.isQuitting = true; app.quit(); } }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Home', accelerator: 'CmdOrCtrl+H', click: () => mainWindow.webContents.send('navigate', '/') },
        { label: 'Search', accelerator: 'CmdOrCtrl+F', click: () => mainWindow.webContents.send('navigate', '/search') },
        { label: 'Library', accelerator: 'CmdOrCtrl+L', click: () => mainWindow.webContents.send('navigate', '/library') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    {
      label: 'Playback',
      submenu: [
        { label: 'Play/Pause', accelerator: 'Space', click: () => mainWindow.webContents.send('toggle-play') },
        { label: 'Next Track', accelerator: 'CmdOrCtrl+Right', click: () => mainWindow.webContents.send('next-track') },
        { label: 'Previous Track', accelerator: 'CmdOrCtrl+Left', click: () => mainWindow.webContents.send('prev-track') },
        { type: 'separator' },
        { label: 'Volume Up', accelerator: 'CmdOrCtrl+Up', click: () => mainWindow.webContents.send('volume-up') },
        { label: 'Volume Down', accelerator: 'CmdOrCtrl+Down', click: () => mainWindow.webContents.send('volume-down') },
        { label: 'Mute', accelerator: 'CmdOrCtrl+M', click: () => mainWindow.webContents.send('toggle-mute') }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => require('electron').shell.openExternal('https://github.com/yourusername/streamify/wiki') },
        { label: 'Report Issue', click: () => require('electron').shell.openExternal('https://github.com/yourusername/streamify/issues') },
        { type: 'separator' },
        { label: 'About Streamify', click: () => mainWindow.webContents.send('navigate', '/credits') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Media keys (Windows/Linux)
app.on('browser-window-created', (_, window) => {
  require('electron-localshortcut').register(window, 'MediaPlayPause', () => {
    mainWindow.webContents.send('toggle-play');
  });
  require('electron-localshortcut').register(window, 'MediaNextTrack', () => {
    mainWindow.webContents.send('next-track');
  });
  require('electron-localshortcut').register(window, 'MediaPreviousTrack', () => {
    mainWindow.webContents.send('prev-track');
  });
});

// App lifecycle
app.on('ready', () => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-path', () => app.getPath('userData'));
ipcMain.handle('get-version', () => app.getVersion());

// Auto-updater (optional - requires electron-updater)
const { autoUpdater } = require('electron-updater');
autoUpdater.checkForUpdatesAndNotify();
\`\`\`

### 2. `electron/preload.js`

\`\`\`javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to renderer
contextBridge.exposeInMainWorld('electron', {
  // App info
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Navigation
  onNavigate: (callback) => ipcRenderer.on('navigate', (_, path) => callback(path)),
  
  // Playback controls
  onTogglePlay: (callback) => ipcRenderer.on('toggle-play', callback),
  onNextTrack: (callback) => ipcRenderer.on('next-track', callback),
  onPrevTrack: (callback) => ipcRenderer.on('prev-track', callback),
  onVolumeUp: (callback) => ipcRenderer.on('volume-up', callback),
  onVolumeDown: (callback) => ipcRenderer.on('volume-down', callback),
  onToggleMute: (callback) => ipcRenderer.on('toggle-mute', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
\`\`\`

### 3. Update `package.json`

\`\`\`json
{
  "name": "streamify",
  "version": "2.0.0",
  "description": "A beautiful cross-platform music streaming application",
  "main": "electron/main.js",
  "homepage": "./",
  "author": "Streamify Contributors",
  "license": "MIT",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "electron:dev": "concurrently \\"cross-env BROWSER=none npm start\\" \\"wait-on http://localhost:3000 && electron .\\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:linux": "npm run build && electron-builder --linux",
    "electron:build:all": "npm run build && electron-builder -mwl"
  },
  "build": {
    "appId": "com.streamify.app",
    "productName": "Streamify",
    "copyright": "Copyright © 2026 Streamify Contributors",
    "files": [
      "build/**/*",
      "electron/**/*",
      "src/backend/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "electron"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "electron/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "electron/icon.icns",
      "category": "public.app-category.music"
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "icon": "electron/icon.png",
      "category": "Audio"
    },
    "publish": {
      "provider": "github",
      "owner": "yourusername",
      "repo": "streamify"
    }
  }
}
\`\`\`

---

## 🗃️ Database Migration: MongoDB → SQLite

### Install better-sqlite3

\`\`\`bash
npm install better-sqlite3
\`\`\`

### Create SQLite service (src/backend/utils/sqlite.ts)

\`\`\`typescript
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'streamify.db');
const db = new Database(dbPath);

// Create tables
db.exec(\`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    username TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    tracks TEXT, -- JSON array
    created_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    track_id TEXT,
    title TEXT,
    artist TEXT,
    played_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
\`);

export default db;
\`\`\`

---

## 🚀 Build & Distribution

### Development Mode

\`\`\`bash
npm run electron:dev
\`\`\`

This starts:
1. React dev server on http://localhost:3000
2. Express backend on http://localhost:3001
3. Electron app loading the dev server

### Production Build

\`\`\`bash
# Build for current platform
npm run electron:build

# Build for Windows
npm run electron:build:win

# Build for macOS
npm run electron:build:mac

# Build for Linux
npm run electron:build:linux

# Build for all platforms
npm run electron:build:all
\`\`\`

Output files go to `dist/` directory:
- **Windows**: `Streamify-Setup-2.0.0.exe`, `Streamify-2.0.0-portable.exe`
- **macOS**: `Streamify-2.0.0.dmg`, `Streamify-2.0.0-mac.zip`
- **Linux**: `Streamify-2.0.0.AppImage`, `streamify_2.0.0_amd64.deb`, `streamify-2.0.0.x86_64.rpm`

---

## 📦 GitHub Releases Distribution

### Setup GitHub Actions Auto-Build

Create `.github/workflows/build.yml`:

\`\`\`yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build Electron app
        run: npm run electron:build
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: \${{ matrix.os }}-build
          path: dist/*
      
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
\`\`\`

### Create Release

\`\`\`bash
git tag v2.0.0
git push origin v2.0.0
\`\`\`

GitHub Actions will automatically:
1. Build for Windows, macOS, Linux
2. Create a release with binaries
3. Users can download from GitHub Releases page

---

## 🔄 Auto-Updates

Install electron-updater:

\`\`\`bash
npm install electron-updater
\`\`\`

Add to `main.js`:

\`\`\`javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
\`\`\`

---

## ✅ Final Checklist

- [ ] Install Electron dependencies
- [ ] Create `electron/` directory with main.js, preload.js
- [ ] Update package.json with Electron scripts
- [ ] Migrate MongoDB to SQLite
- [ ] Create app icons (png, ico, icns)
- [ ] Test in development mode
- [ ] Build for all platforms
- [ ] Set up GitHub Actions for auto-builds
- [ ] Create first release on GitHub
- [ ] Test auto-updater
- [ ] Write installation guide for users

---

## 🎉 Benefits of Desktop App

1. **No Hosting Costs**: Distributed via GitHub Releases ($0/month)
2. **Legal Protection**: Each user runs their own instance
3. **Better Performance**: Local backend, no network latency
4. **Native Features**: System tray, media keys, notifications
5. **Privacy**: All data stored locally
6. **Offline Support**: Works without internet (for cached content)
7. **Auto-Updates**: Automatic version updates from GitHub

---

## 📚 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build)
- [electron-updater](https://www.electron.build/auto-update)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

Ready to convert to desktop app! 🚀
