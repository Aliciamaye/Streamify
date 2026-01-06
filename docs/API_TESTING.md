# API Testing Guide

Complete guide for testing all 56 API endpoints in Streamify.

## 🚀 Quick Start

```bash
# Start the backend server
cd src/backend
npm install
npm run dev
```

Server will run on `http://localhost:3001`

## 🔑 Authentication

Most endpoints require authentication. First, register and login to get tokens.

### 1. Register
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "displayName": "Test User"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "username": "testuser", ... },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### 2. Login
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

### 3. Use Token in Requests
Add the access token to all authenticated requests:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎵 Music API (8 endpoints)

### Search Tracks
```http
GET http://localhost:3001/api/music/search?q=bohemian%20rhapsody
Authorization: Bearer YOUR_TOKEN
```

### Get Track Details
```http
GET http://localhost:3001/api/music/track/VIDEO_ID
Authorization: Bearer YOUR_TOKEN
```

### Get Album
```http
GET http://localhost:3001/api/music/album/BROWSE_ID
Authorization: Bearer YOUR_TOKEN
```

### Get Artist
```http
GET http://localhost:3001/api/music/artist/CHANNEL_ID
Authorization: Bearer YOUR_TOKEN
```

### Get Trending
```http
GET http://localhost:3001/api/music/trending
Authorization: Bearer YOUR_TOKEN
```

### Get Charts
```http
GET http://localhost:3001/api/music/charts
Authorization: Bearer YOUR_TOKEN
```

### Get New Releases
```http
GET http://localhost:3001/api/music/new-releases
Authorization: Bearer YOUR_TOKEN
```

### Get Stream URL
```http
GET http://localhost:3001/api/music/stream/VIDEO_ID
Authorization: Bearer YOUR_TOKEN
```

---

## 🎯 Recommendations API (5 endpoints)

### Get Personalized Recommendations
```http
GET http://localhost:3001/api/recommendations/personalized?limit=20
Authorization: Bearer YOUR_TOKEN
```

### Get Similar Tracks
```http
GET http://localhost:3001/api/recommendations/similar/TRACK_ID?limit=10
Authorization: Bearer YOUR_TOKEN
```

### Create Radio Station
```http
POST http://localhost:3001/api/recommendations/radio
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "seedType": "track",
  "seedId": "VIDEO_ID"
}
```

### Get Trending Tracks
```http
GET http://localhost:3001/api/recommendations/trending
Authorization: Bearer YOUR_TOKEN
```

### Get Mood-Based Recommendations
```http
GET http://localhost:3001/api/recommendations/mood?mood=energetic&limit=20
Authorization: Bearer YOUR_TOKEN
```

**Available moods:** `energetic`, `chill`, `happy`, `sad`, `focus`

---

## 📝 Playlists API (18 endpoints)

### Get User Playlists
```http
GET http://localhost:3001/api/playlists
Authorization: Bearer YOUR_TOKEN
```

### Create Playlist
```http
POST http://localhost:3001/api/playlists
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "My Summer Hits",
  "description": "Best songs for summer 2024",
  "isPublic": true,
  "isCollaborative": false
}
```

### Get Playlist
```http
GET http://localhost:3001/api/playlists/PLAYLIST_ID
Authorization: Bearer YOUR_TOKEN
```

### Update Playlist
```http
PUT http://localhost:3001/api/playlists/PLAYLIST_ID
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description"
}
```

### Delete Playlist
```http
DELETE http://localhost:3001/api/playlists/PLAYLIST_ID
Authorization: Bearer YOUR_TOKEN
```

### Add Tracks to Playlist
```http
POST http://localhost:3001/api/playlists/PLAYLIST_ID/tracks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "tracks": [
    {
      "id": "VIDEO_ID_1",
      "title": "Song Title",
      "artist": "Artist Name",
      "duration": 240,
      "thumbnailUrl": "https://..."
    }
  ]
}
```

### Remove Track from Playlist
```http
DELETE http://localhost:3001/api/playlists/PLAYLIST_ID/tracks/TRACK_ID
Authorization: Bearer YOUR_TOKEN
```

### Reorder Tracks
```http
PUT http://localhost:3001/api/playlists/PLAYLIST_ID/reorder
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "fromIndex": 0,
  "toIndex": 5
}
```

### Follow Playlist
```http
POST http://localhost:3001/api/playlists/PLAYLIST_ID/follow
Authorization: Bearer YOUR_TOKEN
```

### Unfollow Playlist
```http
DELETE http://localhost:3001/api/playlists/PLAYLIST_ID/follow
Authorization: Bearer YOUR_TOKEN
```

### Like Playlist
```http
POST http://localhost:3001/api/playlists/PLAYLIST_ID/like
Authorization: Bearer YOUR_TOKEN
```

### Unlike Playlist
```http
DELETE http://localhost:3001/api/playlists/PLAYLIST_ID/like
Authorization: Bearer YOUR_TOKEN
```

### Add Collaborator
```http
POST http://localhost:3001/api/playlists/PLAYLIST_ID/collaborators
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "username": "collaborator_username"
}
```

### Remove Collaborator
```http
DELETE http://localhost:3001/api/playlists/PLAYLIST_ID/collaborators/USER_ID
Authorization: Bearer YOUR_TOKEN
```

### Duplicate Playlist
```http
POST http://localhost:3001/api/playlists/PLAYLIST_ID/duplicate
Authorization: Bearer YOUR_TOKEN
```

### Get Public Playlists
```http
GET http://localhost:3001/api/playlists/public?limit=20
Authorization: Bearer YOUR_TOKEN
```

### Get Popular Playlists
```http
GET http://localhost:3001/api/playlists/popular?limit=20
Authorization: Bearer YOUR_TOKEN
```

### Search Playlists
```http
GET http://localhost:3001/api/playlists/search?q=summer&limit=10
Authorization: Bearer YOUR_TOKEN
```

---

## 📜 Lyrics API (3 endpoints)

### Get Lyrics (Static)
```http
GET http://localhost:3001/api/lyrics?title=Bohemian%20Rhapsody&artist=Queen
Authorization: Bearer YOUR_TOKEN
```

### Get Synced Lyrics
```http
GET http://localhost:3001/api/lyrics/synced/VIDEO_ID
Authorization: Bearer YOUR_TOKEN
```

### Search Lyrics
```http
GET http://localhost:3001/api/lyrics/search?q=is%20this%20the%20real%20life
Authorization: Bearer YOUR_TOKEN
```

**Free Sources (NO API KEYS NEEDED):**
1. Lyrics.ovh API (primary)
2. Genius scraping
3. AZLyrics scraping
4. YouTube Music (fallback)

---

## 👥 Social API (16 endpoints)

### Get User Profile
```http
GET http://localhost:3001/api/social/profile/USER_ID
Authorization: Bearer YOUR_TOKEN
```

### Update Profile
```http
PUT http://localhost:3001/api/social/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "displayName": "New Name",
  "bio": "Music lover 🎵",
  "avatar": "https://..."
}
```

### Follow User
```http
POST http://localhost:3001/api/social/follow/USER_ID
Authorization: Bearer YOUR_TOKEN
```

### Unfollow User
```http
POST http://localhost:3001/api/social/unfollow/USER_ID
Authorization: Bearer YOUR_TOKEN
```

### Get Followers
```http
GET http://localhost:3001/api/social/followers
Authorization: Bearer YOUR_TOKEN
```

### Get Following
```http
GET http://localhost:3001/api/social/following
Authorization: Bearer YOUR_TOKEN
```

### Check if Following
```http
GET http://localhost:3001/api/social/is-following/USER_ID
Authorization: Bearer YOUR_TOKEN
```

### Get User Suggestions
```http
GET http://localhost:3001/api/social/suggestions?limit=10
Authorization: Bearer YOUR_TOKEN
```

### Get Popular Users
```http
GET http://localhost:3001/api/social/popular?limit=20
Authorization: Bearer YOUR_TOKEN
```

### Get Social Feed
```http
GET http://localhost:3001/api/social/feed?limit=50
Authorization: Bearer YOUR_TOKEN
```

### Get User Activity
```http
GET http://localhost:3001/api/social/activity/USER_ID?limit=30
Authorization: Bearer YOUR_TOKEN
```

### Share Content
```http
POST http://localhost:3001/api/social/share
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "itemType": "track",
  "itemId": "VIDEO_ID",
  "platform": "twitter"
}
```

**Available platforms:** `twitter`, `facebook`, `whatsapp`, `telegram`, `copy`

### Get Trending Content
```http
GET http://localhost:3001/api/social/trending?limit=20
Authorization: Bearer YOUR_TOKEN
```

### Get Social Stats
```http
GET http://localhost:3001/api/social/stats
Authorization: Bearer YOUR_TOKEN
```

### Search Users
```http
GET http://localhost:3001/api/social/search?q=john&limit=10
Authorization: Bearer YOUR_TOKEN
```

### Get Mutual Followers
```http
GET http://localhost:3001/api/social/mutual/USER_ID
Authorization: Bearer YOUR_TOKEN
```

---

## 👤 User API (1 endpoint)

### Get Current User
```http
GET http://localhost:3001/api/user/me
Authorization: Bearer YOUR_TOKEN
```

---

## 🔄 Auth Token Management

### Refresh Token
```http
POST http://localhost:3001/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### Logout
```http
POST http://localhost:3001/api/auth/logout
Authorization: Bearer YOUR_TOKEN
```

---

## 🧪 Testing Tools

### VS Code REST Client
Install the "REST Client" extension and create a `.http` file:

```http
@baseUrl = http://localhost:3001
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Register
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "displayName": "Test User"
}

### Search Music
GET {{baseUrl}}/api/music/search?q=queen
Authorization: Bearer {{token}}
```

### Postman Collection
Import this collection into Postman:

```json
{
  "info": {
    "name": "Streamify API",
    "description": "Complete API collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!","displayName":"Test User"}'
```

**Search Music:**
```bash
curl -X GET "http://localhost:3001/api/music/search?q=queen" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Playlist:**
```bash
curl -X POST http://localhost:3001/api/playlists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Playlist","isPublic":true}'
```

---

## 📊 Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional error details"
}
```

---

## ⚡ Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** 
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets

---

## 🐛 Common Issues

### 401 Unauthorized
- Token expired (15 minutes lifetime)
- Solution: Use refresh token to get new access token

### 429 Too Many Requests
- Rate limit exceeded
- Solution: Wait for rate limit to reset

### 404 Not Found
- Invalid resource ID
- Solution: Verify the ID exists

### 500 Internal Server Error
- Server-side error
- Solution: Check server logs

---

## 📝 Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Refresh access token
- [ ] Logout

### Music
- [ ] Search tracks
- [ ] Get track details
- [ ] Get stream URL
- [ ] Get trending music

### Recommendations
- [ ] Get personalized recommendations
- [ ] Create radio station
- [ ] Get similar tracks
- [ ] Get mood-based recommendations

### Playlists
- [ ] Create playlist
- [ ] Add tracks to playlist
- [ ] Follow/unfollow playlist
- [ ] Like/unlike playlist
- [ ] Add collaborators
- [ ] Search playlists

### Lyrics
- [ ] Get static lyrics
- [ ] Get synced lyrics
- [ ] Test fallback sources

### Social
- [ ] Follow/unfollow users
- [ ] Get social feed
- [ ] Share content
- [ ] Get user suggestions
- [ ] Search users

---

## 🎯 Complete Test Workflow

1. **Register and Login**
   ```bash
   POST /api/auth/register
   POST /api/auth/login
   ```

2. **Search and Play Music**
   ```bash
   GET /api/music/search?q=test
   GET /api/music/track/{id}
   GET /api/music/stream/{id}
   ```

3. **Create Playlist**
   ```bash
   POST /api/playlists
   POST /api/playlists/{id}/tracks
   ```

4. **Get Recommendations**
   ```bash
   GET /api/recommendations/personalized
   POST /api/recommendations/radio
   ```

5. **Get Lyrics**
   ```bash
   GET /api/lyrics?title=Song&artist=Artist
   ```

6. **Social Interaction**
   ```bash
   POST /api/social/follow/{userId}
   GET /api/social/feed
   POST /api/social/share
   ```

---

## 💡 Pro Tips

1. **Save tokens** in environment variables for easier testing
2. **Use Postman environments** for different test scenarios
3. **Test error cases** by sending invalid data
4. **Monitor rate limits** in response headers
5. **Check server logs** for detailed error information
6. **Test lyrics fallback** by requesting obscure songs
7. **Test collaborative playlists** with multiple users
8. **Verify caching** by making repeated requests

---

## 🚀 Next Steps

- Test all 56 endpoints systematically
- Create automated test suite (Jest/Supertest)
- Set up continuous integration
- Monitor performance metrics
- Test with realistic data volumes
- Implement E2E tests

---

**Total API Endpoints: 56**
- Auth: 5
- Music: 8
- Recommendations: 5
- Playlists: 18
- Lyrics: 3
- Social: 16
- User: 1

**All features work for $0/month! 🎉**
