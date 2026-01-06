# 🚀 Quick Start Guide

## Installation (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables (create .env file)
echo 'PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change-this-in-production
JWT_REFRESH_SECRET=change-this-in-production' > .env

# 3. Add npm scripts (copy these into package.json "scripts")
npm install concurrently ts-node

# 4. Run the app
npm run dev
```

## Quick Commands

```bash
npm run dev              # Start frontend (3000) + backend (5000)
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
npm run build          # Build for production
npm start              # Run production build
npm type-check         # Check TypeScript errors
```

## Test the APIs

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"Password123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Search music
curl "http://localhost:5000/api/music/search?q=lofi&limit=5"

# Get trending
curl "http://localhost:5000/api/music/trending?limit=10"

# Health check
curl http://localhost:5000/health
```

## File Structure

```
src/
├── frontend/
│   ├── contexts/        # AuthContext, PlayerContext, ThemeContext
│   ├── components/      # React components (ready for you to build)
│   ├── utils/           # apiClient.ts (frontend SDK)
│   └── App.tsx          # Main component
│
└── backend/
    ├── services/        # YouTubeMusicClient, MusicService, AuthService
    ├── controllers/     # musicController, authController
    ├── routes/          # API route definitions
    ├── middleware/      # authMiddleware
    ├── models/          # User model
    ├── utils/           # helpers, logger, cache
    └── server.ts        # Express app

package.json            # npm dependencies and scripts
.env                    # Environment variables
```

## Key Features

✅ **Real YouTube Music** - Not mock data
✅ **JWT Authentication** - Secure user login
✅ **Caching** - Smart TTL-based caching (prevents rate limiting)
✅ **Rate Limiting** - 100 requests per 15 minutes
✅ **TypeScript** - 100% type safe
✅ **Production Ready** - Ready to deploy

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Music
- `GET /api/music/search?q=query` - Search songs
- `GET /api/music/trending` - Trending music
- `GET /api/music/:videoId` - Song details
- `GET /api/music/:videoId/stream` - Playback URL
- `GET /api/music/artist/:channelId` - Artist info
- `GET /api/music/album/:browseId` - Album info

### User
- `PUT /api/user/profile` - Update profile

## Usage Example

```typescript
import { useAuth } from './contexts/AuthContext';
import { apiClient } from './utils/apiClient';

export function MyComponent() {
  const { user, login } = useAuth();

  const handleLogin = async () => {
    await login('user@example.com', 'Password123!');
  };

  const handleSearch = async () => {
    const response = await apiClient.searchMusic('lofi hip hop');
    console.log(response.data.results);
  };

  return (
    <div>
      {user ? <p>Welcome {user.username}</p> : <button onClick={handleLogin}>Login</button>}
      <button onClick={handleSearch}>Search Music</button>
    </div>
  );
}
```

## What You Need to Build

- ✅ Backend API - **DONE**
- ✅ Authentication - **DONE**
- ✅ Caching System - **DONE**
- ⏳ Login/Signup Pages - **TODO** (You can build this now!)
- ⏳ Search Component - **TODO**
- ⏳ Music Player - **TODO**
- ⏳ User Profile - **TODO**

## Folder Structure Explained

**src/** - All source code
- **frontend/** - React app code
- **backend/** - Express API server

**Root files:**
- `package.json` - Dependencies
- `SETUP.md` - Detailed setup guide
- `COMPLETION_SUMMARY.md` - What's done
- `PRODUCTION_FILES.md` - All files created

## Environments

```
Development:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: (add MongoDB later)

Production:
- Single server deployment
- Environment variables from .env
- Compiled TypeScript
```

## Next Steps

1. **Run the app**: `npm run dev`
2. **Test the APIs**: Use curl commands above
3. **Build UI**: Create React components in `src/frontend/components/`
4. **Connect to APIs**: Use `apiClient` in your components
5. **Add Database**: Integrate MongoDB/PostgreSQL
6. **Deploy**: Docker or cloud platform

## Troubleshooting

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Token expired?**
Auto-refreshed on protected endpoints. Manual refresh:
```typescript
await apiClient.refreshAccessToken();
```

**CORS error?**
Ensure backend is running and FRONTEND_URL in .env matches your frontend URL

**YouTube rate limited?**
Cache is working! Restart server to reset. Or call:
```bash
curl -X POST http://localhost:5000/api/music/cache/clear
```

## More Help

- See [SETUP.md](SETUP.md) for detailed guide
- See [PRODUCTION_FILES.md](PRODUCTION_FILES.md) for what was created
- Check code comments in backend files
- Use browser DevTools Network tab to debug API calls

## Email & Password Requirements

**Email:** Any valid email format (user@example.com)

**Password:** Must have
- ✓ At least 8 characters
- ✓ At least 1 uppercase letter (A-Z)
- ✓ At least 1 lowercase letter (a-z)
- ✓ At least 1 number (0-9)
- ✓ At least 1 special character (!@#$%^&*)

Example: `MyPassword123!`

---

**You're all set! Happy coding! 🎵**
