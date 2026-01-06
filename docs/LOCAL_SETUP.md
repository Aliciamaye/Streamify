# 🚀 Local Development Guide

## Quick Start (2 Minutes)

### Step 1: Install Backend Dependencies
```powershell
cd src\backend
npm install
```

### Step 2: Start Backend Server
```powershell
# Still in src\backend folder
npm run dev
```

**Backend will run on: http://localhost:3001**

### Step 3: Start Frontend (New Terminal)
```powershell
# Open a NEW terminal window
# Navigate to project root
cd C:\Users\JACOBBB\Desktop\streamify

npm run dev
```

**Frontend will run on: http://localhost:5173**

---

## 🎯 That's It! Open Your Browser

Navigate to: **http://localhost:5173**

---

## 📋 Detailed Instructions

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ npm installed

### Backend Setup

1. **Navigate to backend:**
   ```powershell
   cd C:\Users\JACOBBB\Desktop\streamify\src\backend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start development server:**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   Server running on http://localhost:3001
   Environment: development
   ```

### Frontend Setup

1. **Open a NEW terminal**

2. **Navigate to project root:**
   ```powershell
   cd C:\Users\JACOBBB\Desktop\streamify
   ```

3. **Dependencies already installed** (from your terminal history)

4. **Start development server:**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   VITE v5.0.0  ready in 500 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.x:5173/
   ```

---

## 🧪 Testing the API

### Method 1: Browser (Quick Test)

Open: http://localhost:3001/api/auth/register

You should see a response (even if it's an error, it means the server works!)

### Method 2: PowerShell (Detailed Test)

```powershell
# Register a user
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"testuser","email":"test@example.com","password":"Test123!","displayName":"Test User"}'

# Login
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"Test123!"}'

# Search music (replace YOUR_TOKEN with token from login)
Invoke-RestMethod -Uri "http://localhost:3001/api/music/search?q=queen" -Headers @{Authorization="Bearer YOUR_TOKEN"}
```

### Method 3: VS Code REST Client Extension

1. Install "REST Client" extension
2. Create a file `test.http`:

```http
### Register User
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "displayName": "Test User"
}

### Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

3. Click "Send Request" above each `###`

---

## 🎵 Using the App

1. **Open browser:** http://localhost:5173

2. **Register an account:**
   - Click "Sign Up"
   - Fill in username, email, password
   - Click "Register"

3. **Search for music:**
   - Use the search bar
   - Type "Bohemian Rhapsody" or any song name
   - Press Enter

4. **Play music:**
   - Click on any track
   - Music player appears at bottom

5. **Explore features:**
   - **Recommendations**: Click "Discover" tab
   - **Playlists**: Create playlists, add songs
   - **Social**: Follow users, see activity
   - **Lyrics**: Click lyrics button on player
   - **Equalizer**: Open audio settings

---

## 🔧 Troubleshooting

### Backend won't start

**Error: Port 3001 already in use**
```powershell
# Kill process on port 3001
npx kill-port 3001

# Then restart
npm run dev
```

**Error: Cannot find module**
```powershell
# Reinstall dependencies
rm -r node_modules
npm install
```

### Frontend won't start

**Error: Port 5173 already in use**
```powershell
# Kill process on port 5173
npx kill-port 5173

# Then restart
npm run dev
```

**Error: Failed to fetch**
- Make sure backend is running on port 3001
- Check `.env.local` has correct backend URL

### API errors

**401 Unauthorized**
- You need to login first
- Token might have expired (15 min lifetime)
- Get a new token by logging in again

**CORS errors**
- Make sure backend `.env` has correct FRONTEND_URL
- Restart backend after changing `.env`

**500 Internal Server Error**
- Check backend terminal for error logs
- Might be a bug - check the error message

---

## 📊 Available Scripts

### Backend (src/backend/)
```powershell
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production build
npm run lint     # Check code for errors
```

### Frontend (root directory)
```powershell
npm run dev      # Start development server with HMR
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
npm run lint     # Check code for errors
```

---

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health (if implemented)

---

## 📝 Environment Variables

### Backend (.env in src/backend/)
```env
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local in root)
```env
VITE_API_URL=http://localhost:3001
```

---

## 🐛 Common Issues

### "Cannot connect to backend"
✅ **Solution**: Make sure backend is running on port 3001

### "Module not found"
✅ **Solution**: Run `npm install` in correct directory

### "Build failed"
✅ **Solution**: Check for TypeScript errors, run `npm run lint`

### "API returns 404"
✅ **Solution**: Check the endpoint URL is correct

---

## 🎉 You're All Set!

Your app is now running locally with:
- ✅ Backend API (56 endpoints)
- ✅ Frontend UI (React + Vite)
- ✅ Music streaming (YouTube Music)
- ✅ AI recommendations
- ✅ Lyrics system (4 free sources)
- ✅ Social features
- ✅ Playlist management
- ✅ 10-band equalizer

**Cost to run locally: $0**

---

## 📚 Next Steps

1. **Test API endpoints**: See [docs/API_TESTING.md](API_TESTING.md)
2. **Deploy to production**: See [docs/DEPLOYMENT.md](DEPLOYMENT.md)
3. **Read full features**: See [docs/FEATURES.md](FEATURES.md)
4. **Developer reference**: See [docs/DEV_REFERENCE.md](DEV_REFERENCE.md)

---

**Happy Testing! 🎵**
