# 🚀 Developer Quick Reference

Quick reference for common development tasks in Streamify.

## 📦 Installation

```bash
# Clone and setup
git clone https://github.com/yourusername/streamify.git
cd streamify
npm install
cd src/backend && npm install && cd ../..

# Start development
npm run dev  # Frontend (port 5173)
cd src/backend && npm run dev  # Backend (port 3001)
```

## 🔑 Environment Variables

### Backend (src/backend/.env)
```env
PORT=3001
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## 🎯 Common API Calls

### Register & Login
```typescript
// Register
const res = await apiClient.register({
  username: 'user',
  email: 'user@example.com',
  password: 'Pass123!',
  displayName: 'User Name'
});

// Login
const res = await apiClient.login('user@example.com', 'Pass123!');
localStorage.setItem('accessToken', res.data.tokens.accessToken);
```

### Search & Play Music
```typescript
// Search
const tracks = await apiClient.searchTracks('query');

// Get stream URL
const url = await apiClient.getStreamUrl(trackId);

// Play in audio element
audio.src = url.data.streamUrl;
audio.play();
```

### Recommendations
```typescript
// Get personalized
const recs = await apiClient.getPersonalizedRecommendations(20);

// Create radio
const radio = await apiClient.createRadioStation('track', trackId);

// Get similar tracks
const similar = await apiClient.getSimilarTracks(trackId, 10);
```

### Playlists
```typescript
// Create
const playlist = await apiClient.createPlaylist({
  name: 'My Playlist',
  isPublic: true,
  isCollaborative: false
});

// Add tracks
await apiClient.addTracksToPlaylist(playlistId, [track1, track2]);

// Follow
await apiClient.followPlaylist(playlistId);
```

### Lyrics
```typescript
// Get lyrics
const lyrics = await apiClient.getLyrics('Song Title', 'Artist Name');

// Get synced lyrics
const synced = await apiClient.getSyncedLyrics(videoId);
```

### Social
```typescript
// Follow user
await apiClient.followUser(userId);

// Get feed
const feed = await apiClient.getSocialFeed();

// Share
await apiClient.shareContent('track', trackId, 'twitter');
```

## 🎨 Adding New UI Components

### Create Component
```typescript
// src/frontend/components/MyComponent/MyComponent.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-surface rounded-lg p-4"
    >
      <h2 className="text-white font-bold">{title}</h2>
    </motion.div>
  );
};

export default MyComponent;
```

### Add Route
```typescript
// src/frontend/App.tsx
import MyComponent from './components/MyComponent/MyComponent';

<Route path="/mypage" element={<MyComponent title="My Page" />} />
```

## 🔧 Backend Development

### Add New Service
```typescript
// src/backend/services/MyService.ts
export class MyService {
  async doSomething(param: string) {
    // Implementation
    return { result: 'success' };
  }
}

export default new MyService();
```

### Add Controller
```typescript
// src/backend/controllers/myController.ts
import myService from '../services/MyService';

export const myEndpoint = async (req: Request, res: Response) => {
  try {
    const result = await myService.doSomething(req.body.param);
    res.json(new ApiResponse(true, result));
  } catch (error) {
    res.status(500).json(new ApiResponse(false, null, error.message));
  }
};
```

### Add Routes
```typescript
// src/backend/routes/myRoutes.ts
import { Router } from 'express';
import { myEndpoint } from '../controllers/myController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/something', authenticateToken, asyncHandler(myEndpoint));

export default router;
```

### Connect to Server
```typescript
// src/backend/server.ts
import myRoutes from './routes/myRoutes';

app.use('/api/my', myRoutes);
```

## 🧪 Testing

### Test API Endpoint
```bash
# Using curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Using REST Client (VS Code extension)
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

## 🎨 Styling Guide

### Tailwind CSS Classes
```typescript
// Backgrounds
className="bg-surface"       // Surface color from theme
className="bg-primary"       // Primary color
className="bg-white/10"      // White with 10% opacity

// Text
className="text-white"       // White text
className="text-white/60"    // White with 60% opacity
className="text-primary"     // Primary color text

// Spacing
className="p-4"             // Padding 1rem
className="mx-auto"         // Margin auto horizontal
className="gap-4"           // Gap 1rem

// Layout
className="flex items-center justify-between"
className="grid grid-cols-3 gap-4"

// Effects
className="hover:bg-white/10 transition-colors"
className="backdrop-blur-lg"
className="rounded-lg"
```

### Framer Motion Animations
```typescript
// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>

// Slide up
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
/>

// Hover scale
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

## 🔍 Debugging

### Backend Logs
```typescript
// src/backend/utils/logger.ts
import logger from '../utils/logger';

logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error });
logger.debug('Debug info', { data });
```

### Frontend Console
```typescript
console.log('Debug:', data);
console.error('Error:', error);

// React DevTools
// Install: https://react.dev/learn/react-developer-tools
```

### Network Requests
```typescript
// Chrome DevTools → Network tab
// Filter: XHR
// View request/response
```

## 📁 Project Structure

```
streamify/
├── src/
│   ├── frontend/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utilities
│   │   ├── App.tsx         # Main app
│   │   └── index.tsx       # Entry point
│   └── backend/
│       ├── services/       # Business logic
│       ├── controllers/    # Route handlers
│       ├── routes/         # API routes
│       ├── middleware/     # Express middleware
│       ├── utils/          # Utilities
│       └── server.ts       # Express server
├── docs/                   # Documentation
└── package.json
```

## 🚀 Deployment

### Build
```bash
# Frontend
npm run build  # Output: dist/

# Backend
cd src/backend
npm run build  # Output: dist/
```

### Deploy
```bash
# Vercel (Frontend)
vercel --prod

# Railway (Backend)
railway up
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001

# Or use different port
PORT=3002 npm run dev
```

### CORS Error
```typescript
// Add to backend server.ts
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### JWT Token Expired
```typescript
// Refresh token
const newTokens = await apiClient.refreshToken(refreshToken);
```

## 📚 Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
npm run dev          # Start with watch mode
npm run build        # Compile TypeScript
npm start            # Run production server

# Both
npm install          # Install dependencies
npm update           # Update dependencies
```

## 🔗 Quick Links

- [API Testing Guide](docs/API_TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Features List](docs/FEATURES.md)
- [Main README](README.md)

## 💡 Pro Tips

1. **Use TypeScript** - Catch errors before runtime
2. **Keep components small** - Single responsibility
3. **Use async/await** - Better than promises
4. **Handle errors** - Try/catch everything
5. **Cache API responses** - Reduce load
6. **Use environment variables** - Never hardcode secrets
7. **Test endpoints** - Before frontend integration
8. **Use React DevTools** - Debug component state
9. **Check Network tab** - Debug API calls
10. **Read error messages** - They usually tell you what's wrong!

---

**Happy Coding! 🎵**
