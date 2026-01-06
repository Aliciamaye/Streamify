<div align="center">

# 🎵 Streamify

### A Premium Music Streaming Experience

![Streamify Banner](docs/images/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

**Stream millions of songs • Create playlists • Connect with friends**

[Get Started](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎧 Music Discovery
- **Intelligent Search** - Find any song, artist, or album instantly
- **Search by Lyrics** - Forgot the song name? Search by lyrics!
- **Smart Recommendations** - AI-powered music suggestions
- **Trending & Charts** - Discover what's popular

</td>
<td width="50%">

### 🎨 Beautiful Design
- **6 Premium Themes** - Midnight, Nebula, Arctic, Sunset, Ocean, Forest
- **Glassmorphism UI** - Modern, sleek interface
- **Responsive** - Perfect on desktop, tablet, and mobile
- **Smooth Animations** - Polished micro-interactions

</td>
</tr>
<tr>
<td width="50%">

### 🔗 Platform Integrations
- **Spotify Import** - Import your playlists with one click
- **Apple Music Sync** - Connect your Apple Music library
- **Last.fm Scrobbling** - Track your listening history
- **Discord Rich Presence** - Show friends what you're playing

</td>
<td width="50%">

### 📊 Advanced Features
- **Lyrics Display** - Time-synced lyrics while you listen
- **Equalizer** - Custom audio presets
- **Offline Mode** - Download for offline playback
- **Cross-Device Sync** - Continue listening anywhere

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

### Home Screen
![Home Screen](docs/images/home.png)

### Now Playing
![Now Playing](docs/images/player.png)

</div>

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js

### Installation

```bash
# Clone the repository
git clone https://github.com/Aliciamaye/Streamify.git
cd Streamify

# Install dependencies
npm install

# Start the backend
cd src/backend
npm install
npm run dev

# In a new terminal, start the frontend
cd src/frontend
npm install
npm run dev
```

### 🌐 Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🏗️ Architecture

```
streamify/
├── src/
│   ├── backend/           # Node.js + Express API
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API endpoints
│   │   └── models/        # Data models
│   │
│   └── frontend/          # React + TypeScript SPA
│       ├── components/    # UI components
│       ├── contexts/      # React contexts
│       ├── utils/         # Helper functions
│       └── constants/     # App constants
│
├── docs/                  # Documentation
└── desktop-builds/        # Electron desktop app
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, TypeScript |
| **Music Source** | YouTube Music API (Reverse Engineered) |
| **Caching** | Redis (optional), In-memory fallback |
| **Auth** | JWT, bcrypt |
| **Integrations** | Spotify, Apple Music, Last.fm, Discord |

---

## 📚 API Endpoints

### Music
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/music/search?q=` | Search for music |
| `GET` | `/api/music/trending` | Get trending tracks |
| `GET` | `/api/music/:videoId` | Get track details |
| `GET` | `/api/music/:videoId/stream` | Get playback URL |

### Lyrics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/lyrics/:videoId` | Get lyrics for a track |
| `GET` | `/api/lyrics/search?q=` | Search songs by lyrics |

### Integrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/spotify/connect` | Connect Spotify |
| `POST` | `/api/spotify/import/:playlistId` | Import playlist |
| `POST` | `/api/lastfm/scrobble` | Scrobble track |

---

## 🎨 Themes

| Theme | Description |
|-------|-------------|
| 🌙 **Midnight** | Deep blues and purples, elegant dark mode |
| 🌌 **Nebula** | Cosmic purples and pinks |
| ❄️ **Arctic** | Cool blues and clean whites |
| 🌅 **Sunset** | Warm oranges and reds |
| 🌊 **Ocean** | Teals and aqua blues |
| 🌲 **Forest** | Natural earth tones and greens |

---

## 📖 Documentation

- [Quick Start Guide](docs/QUICKSTART.md)
- [API Documentation](docs/API_TESTING.md)
- [Environment Variables](docs/ENVIRONMENT_VARIABLES.md)
- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [Desktop App Setup](docs/DESKTOP_QUICK_START.md)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

Streamify is a personal project for educational purposes. It uses YouTube Music's unofficial API through reverse engineering. Please respect YouTube's terms of service and use this responsibly.

---

<div align="center">

### Made with 🎵 by the Streamify Team

**[⭐ Star this repo](https://github.com/Aliciamaye/Streamify)** if you find it useful!

</div>
