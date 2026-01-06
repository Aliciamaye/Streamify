# Streamify Setup & Installation Guide

## 🎯 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Internet connection

### Installation Steps

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**

Create `.env.local` in `src/frontend/`:
```
VITE_API_BASE_URL=http://localhost:5000
```

Create `.env` in root:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

3. **Update package.json with scripts**

Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd src && vite",
    "dev:backend": "ts-node src/backend/server.ts",
    "build": "cd src && vite build && tsc src/backend/server.ts",
    "start": "node dist/backend/server.js",
    "type-check": "tsc --noEmit"
  }
}
```

4. **Install required dependencies**

```bash
npm install express cors dotenv jsonwebtoken bcryptjs axios uuid
npm install --save-dev @types/express @types/node @types/jsonwebtoken typescript ts-node concurrently
```

5. **Run the application**

**Development Mode:**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📊 Project Status

### ✅ Completed
- Folder structure reorganization into unified `src/` folder
- YouTube Music reverse engineering client with full API integration
- Music service layer with intelligent caching (TTL-based)
- Production HTTP controllers for all music endpoints
- Authentication system with JWT tokens
- User management (registration, login, profile)
- Theme and player context setup
- API client for frontend-backend communication
- Comprehensive error handling and logging
- Rate limiting middleware (100 req/15min)
- Response standardization with ApiResponse class

### 🚧 In Progress
- Frontend component integration with real APIs
- Database integration (MongoDB/PostgreSQL)
- Playlist management endpoints
- User preferences persistence
- Advanced search and filtering

### 📋 Next Steps
1. Update `App.tsx` to use AuthProvider and real API calls
2. Create login/signup pages
3. Create music search and player components
4. Connect frontend to backend APIs
5. Add database integration
6. Deploy to production

## 🔧 Development Workflow

### Adding a New API Endpoint

1. **Create controller method** in `src/backend/controllers/`
```typescript
export const myEndpoint = asyncHandler(async (req: Request, res: Response) => {
  // Your logic here
  return res.json(new ApiResponse(true, 'Success', data));
});
```

2. **Add route** in `src/backend/routes/`
```typescript
router.get('/my-endpoint', authenticateToken, myEndpoint);
```

3. **Add API method** in `src/frontend/utils/apiClient.ts`
```typescript
async myEndpoint(): Promise<any> {
  return this.request('/api/my-endpoint', 'GET');
}
```

4. **Use in component** with context
```typescript
const { user } = useAuth();
const response = await apiClient.myEndpoint();
```

### Debugging

1. **Backend Logs**
   - Check console output for color-coded logs
   - Enable DEBUG level in logger for detailed info

2. **API Testing**
   ```bash
   curl -X GET http://localhost:5000/health
   curl -X GET http://localhost:5000/api/music/search?q=lofi
   ```

3. **Cache Statistics**
   ```bash
   curl http://localhost:5000/api/music/cache/stats
   ```

## 🚀 Deployment

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
EXPOSE 5000 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t streamify .
docker run -p 5000:5000 -p 3000:3000 streamify
```

### Cloud Deployment

#### Vercel (Frontend)
```bash
vercel deploy
```

#### Heroku (Backend)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 📱 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Music
- `GET /api/music/search?q=query` - Search songs
- `GET /api/music/trending` - Get trending music
- `GET /api/music/:videoId` - Get song details
- `GET /api/music/:videoId/stream` - Get playback URL

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### CORS Issues
Ensure backend is setting correct CORS headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### JWT Token Expired
Token automatically refreshes when calling protected endpoints. If needed, manually refresh:
```typescript
const newTokens = await apiClient.refreshAccessToken();
```

### YouTube API Rate Limit
Cache prevents most issues. If needed, clear cache:
```bash
curl -X POST http://localhost:5000/api/music/cache/clear
```

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [YouTube Music Reverse Engineering](https://github.com/nicklock/YouTube-Music-API)

## 💡 Tips

1. Use VS Code REST Client extension for API testing
2. Enable "Format on Save" in VS Code settings
3. Use Redux DevTools for state debugging (optional)
4. Run `npm type-check` before commits
5. Keep API client methods simple and focused

---

**Happy Coding! 🎵**
