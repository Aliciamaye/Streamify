# Streamify Integration Features - Complete Documentation

## Overview

Streamify now includes comprehensive integrations with Spotify, Apple Music, Last.fm, and Discord, enabling playlist imports, scrobbling, rich presence, and more.

## Table of Contents
1. [Spotify Integration](#spotify-integration)
2. [Apple Music Integration](#apple-music-integration)
3. [Last.fm Integration](#lastfm-integration)
4. [Discord Integration](#discord-integration)
5. [Technical Architecture](#technical-architecture)
6. [API Endpoints](#api-endpoints)

---

## Spotify Integration

### Features
- ✅ OAuth 2.0 authentication with state-based callback
- ✅ Playlist listing and import (sync and async)
- ✅ Asynchronous job queue with status polling
- ✅ Fuzzy track matching to Streamify catalog
- ✅ Token refresh automation

### User Flow
1. Click "Connect Spotify" in Settings
2. Authorize in popup window
3. View imported playlists
4. Click "Import asynchronously" to queue import job
5. Real-time status updates during import

### Technical Details
- **OAuth Flow**: State-based with UUID mapping (no auth required on callback)
- **Token Storage**: Redis with automatic expiry handling
- **Job Queue**: In-memory processor with Redis status storage
- **Matching Algorithm**: Fuzzy scoring based on title, artist, album, duration
- **Endpoints**: `/api/spotify/*`

### Frontend UI
- Connection status indicator
- Playlist grid with track counts
- Import button with job status polling
- Real-time progress updates

### Environment Variables
```env
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback
```

---

## Apple Music Integration

### Features
- ✅ JWT-based developer token authentication
- ✅ Music User Token storage per user
- ✅ Playlist listing and import
- ✅ Async job queue for large imports
- ✅ Track matching with scoring algorithm

### User Flow
1. Implement MusicKit JS on client to get Music User Token
2. Send token to `/api/applemusic/token`
3. Browse and import playlists
4. Async import with job status tracking

### Technical Details
- **Authentication**: ES256 JWT with 6-month cache + client-side Music User Token
- **Token Storage**: Redis (developer token) + per-user storage (music user token)
- **Matching**: Similar to Spotify with fuzzy scoring
- **Job Queue**: Same infrastructure as Spotify integration
- **Endpoints**: `/api/applemusic/*`

### Frontend UI
- Connection status with MusicKit instructions
- Playlist grid similar to Spotify
- Async import with progress tracking

### Environment Variables
```env
APPLE_MUSIC_TEAM_ID=your-team-id
APPLE_MUSIC_KEY_ID=your-key-id
APPLE_MUSIC_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
```

### Setup Steps
1. Create MusicKit Identifier at developer.apple.com
2. Generate Music Key (.p8 file)
3. Configure Team ID, Key ID, and private key in `.env`

---

## Last.fm Integration

### Features
- ✅ Session key authentication with MD5 signatures
- ✅ Automatic scrobbling
- ✅ Now Playing updates
- ✅ Listening history and statistics
- ✅ Top tracks and artists (7 days, 1 month, 3 months, 6 months, 1 year, overall)
- ✅ Similar track recommendations

### User Flow
1. Click "Connect Last.fm" in Settings
2. Authorize in popup window
3. Automatic scrobbling begins
4. View stats in dedicated sections

### Technical Details
- **Authentication**: Session key with API signature (MD5)
- **Scrobbling**: Automatic on 50% playback or 4 minutes
- **Now Playing**: Real-time updates during playback
- **Stats**: Cached with TTL to avoid rate limits
- **Endpoints**: `/api/lastfm/*`

### Frontend UI
- Connection status with username display
- Scrobbling indicator during playback
- Stats dashboard (future enhancement)

### Environment Variables
```env
LASTFM_API_KEY=your-api-key
LASTFM_API_SECRET=your-api-secret
```

### API Methods
- `scrobble()` - Record completed track play
- `updateNowPlaying()` - Show current track
- `getRecentTracks()` - Recent listening history
- `getTopTracks()` - Most played tracks
- `getTopArtists()` - Favorite artists
- `getSimilarTracks()` - Recommendations based on track

---

## Discord Integration

### Features
- ✅ Rich Presence updates (stored in cache for client polling)
- ✅ Webhook notifications for track changes
- ✅ Share tracks and playlists via embeds
- ✅ Per-user webhook configuration

### User Flow
1. Create Discord webhook in server settings
2. Paste webhook URL in Streamify Settings
3. Enable Rich Presence (client polls `/api/discord/presence`)
4. Tracks/playlists auto-share to configured channel

### Technical Details
- **Rich Presence**: Cached in Redis, client polls for updates
- **Webhooks**: Per-user webhook URLs stored in Redis
- **Embeds**: Rich Discord embeds with thumbnails and metadata
- **Endpoints**: `/api/discord/*`

### Frontend UI
- Webhook URL input with save/remove
- Connection status indicator
- Manual share buttons (future enhancement)

### Environment Variables
```env
DISCORD_CLIENT_ID=your-client-id # Optional
```

### Webhook Setup
1. Server Settings → Integrations → Webhooks → New Webhook
2. Copy webhook URL
3. Paste in Streamify Settings → Discord Integration

---

## Technical Architecture

### Redis Cache Layer
All integrations use a unified Redis cache (`RedisCache` service):
- Token storage with automatic expiry
- Job status tracking
- Rich Presence state
- Webhook URLs
- Stats caching

**Fallback**: In-memory cache if Redis is disabled

### Job Queue System
Background job processor for async operations:
- **Queue**: In-memory with processor pattern
- **Status Storage**: Redis with 24-hour retention
- **Retry Logic**: Built-in with exponential backoff
- **Job Types**: `spotify-import`, `applemusic-import`

### Track Matching Algorithm
Fuzzy matching for imported tracks:
```typescript
score = (titleMatch * 0.4) + (artistMatch * 0.3) + (albumMatch * 0.2) + (durationMatch * 0.1)
```
- Title/artist/album: Levenshtein distance + partial matching
- Duration: ±10% tolerance
- Threshold: 0.6 (60% similarity minimum)

### Service Layer Architecture
```
Controller → Service → Redis/External API
                ↓
          YouTubeMusicEngine (for matching)
```

---

## API Endpoints

### Spotify Endpoints
```
GET    /api/spotify/connect         - Get OAuth URL
GET    /api/spotify/callback        - OAuth callback (no auth)
POST   /api/spotify/callback        - OAuth callback (no auth)
GET    /api/spotify/status          - Connection status
POST   /api/spotify/disconnect      - Disconnect account
GET    /api/spotify/playlists       - List playlists
POST   /api/spotify/playlists/:id/import       - Sync import
POST   /api/spotify/playlists/:id/import/async - Async import
GET    /api/spotify/jobs/:jobId     - Job status
```

### Apple Music Endpoints
```
GET    /api/applemusic/connect      - Get connection instructions
POST   /api/applemusic/token        - Store Music User Token
GET    /api/applemusic/status       - Connection status
POST   /api/applemusic/disconnect   - Disconnect account
GET    /api/applemusic/playlists    - List playlists
POST   /api/applemusic/playlists/:id/import       - Sync import
POST   /api/applemusic/playlists/:id/import/async - Async import
POST   /api/applemusic/playlists/:id/sync         - Sync playlist
GET    /api/applemusic/jobs/:jobId  - Job status
```

### Last.fm Endpoints
```
GET    /api/lastfm/connect          - Get auth URL
GET    /api/lastfm/callback         - OAuth callback
POST   /api/lastfm/callback         - OAuth callback
GET    /api/lastfm/status           - Connection status
POST   /api/lastfm/disconnect       - Disconnect account
POST   /api/lastfm/scrobble         - Scrobble track
POST   /api/lastfm/now-playing      - Update now playing
GET    /api/lastfm/recent-tracks    - Recent history
GET    /api/lastfm/top-tracks       - Top tracks
GET    /api/lastfm/top-artists      - Top artists
GET    /api/lastfm/similar-tracks   - Similar recommendations
```

### Discord Endpoints
```
GET    /api/discord/status          - Integration status
POST   /api/discord/webhook         - Store webhook URL
DELETE /api/discord/webhook         - Remove webhook
POST   /api/discord/presence        - Update Rich Presence
DELETE /api/discord/presence        - Clear Rich Presence
GET    /api/discord/presence        - Get current presence
POST   /api/discord/share/track     - Share track
POST   /api/discord/share/playlist  - Share playlist
```

---

## File Structure

### Backend Services
```
src/backend/services/
├── SpotifyService.ts           - Spotify OAuth and import
├── AppleMusicService.ts        - Apple Music JWT and import
├── LastFmService.ts            - Last.fm scrobbling and stats
├── DiscordService.ts           - Discord webhooks and presence
├── RedisCache.ts               - Unified cache layer
└── JobQueue.ts                 - Background job processor
```

### Backend Controllers
```
src/backend/controllers/
├── spotifyController.ts        - Spotify HTTP handlers
├── appleMusicController.ts     - Apple Music HTTP handlers
├── lastFmController.ts         - Last.fm HTTP handlers
└── discordController.ts        - Discord HTTP handlers
```

### Backend Routes
```
src/backend/routes/
├── spotifyRoutes.ts            - Spotify route definitions
├── appleMusicRoutes.ts         - Apple Music route definitions
├── lastFmRoutes.ts             - Last.fm route definitions
└── discordRoutes.ts            - Discord route definitions
```

### Frontend
```
src/frontend/
├── utils/apiClient.ts          - API client with all methods
└── components/Settings.tsx     - Settings UI with integration cards
```

---

## Testing

### Manual Testing Checklist

**Spotify:**
- [ ] Connect account via OAuth popup
- [ ] List playlists
- [ ] Import playlist (async)
- [ ] Monitor job status updates
- [ ] Disconnect account

**Apple Music:**
- [ ] Configure MusicKit JS
- [ ] Send Music User Token
- [ ] List playlists
- [ ] Import playlist (async)
- [ ] Disconnect account

**Last.fm:**
- [ ] Connect account via OAuth popup
- [ ] Scrobble tracks automatically
- [ ] Update now playing
- [ ] Fetch recent tracks
- [ ] Get top tracks/artists
- [ ] Disconnect account

**Discord:**
- [ ] Configure webhook URL
- [ ] Update Rich Presence
- [ ] Share track via webhook
- [ ] Share playlist via webhook
- [ ] Remove webhook

### API Testing with cURL

```bash
# Get Spotify connection status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/spotify/status

# Import playlist async
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/spotify/playlists/abc123/import/async

# Check job status
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/spotify/jobs/job-uuid

# Scrobble to Last.fm
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artist":"Artist","title":"Track","timestamp":1234567890}' \
  http://localhost:3001/api/lastfm/scrobble
```

---

## Future Enhancements

### Spotify
- [ ] Automatic playlist sync (detect changes)
- [ ] Import user's liked songs
- [ ] Canvas video backgrounds
- [ ] Listening history import

### Apple Music
- [ ] Client-side MusicKit JS integration
- [ ] Apple Music Radio stations
- [ ] For You recommendations
- [ ] Lyrics syncing

### Last.fm
- [ ] Stats dashboard in UI
- [ ] Weekly listening reports
- [ ] Artist/album recommendations
- [ ] Loved tracks sync

### Discord
- [ ] Native Rich Presence client (Electron)
- [ ] Server-side Discord bot integration
- [ ] Reaction-based playback controls
- [ ] Multi-server webhook support
- [ ] Friend activity feed

---

## Troubleshooting

### Spotify OAuth Fails
1. Check `SPOTIFY_REDIRECT_URI` matches dashboard
2. Verify client ID/secret are correct
3. Check popup blocker isn't blocking OAuth window

### Apple Music Token Errors
1. Verify private key format (PEM with newlines)
2. Check Team ID and Key ID match
3. Ensure Music Key is not revoked
4. Verify 6-month expiry hasn't passed

### Last.fm Scrobbles Not Working
1. Check API key and secret are correct
2. Verify session key is stored
3. Check signature generation (MD5)
4. Ensure track played >50% or 4 minutes

### Discord Webhook Fails
1. Verify webhook URL format
2. Check webhook hasn't been deleted in Discord
3. Ensure payload size < 2000 characters
4. Check server permissions

### Redis Connection Issues
1. Verify Redis host/port/password
2. Check firewall allows connection
3. Test with `redis-cli` manually
4. Check `REDIS_ENABLED` is set to `true`
5. Review logs for connection errors

---

## Performance Considerations

### Rate Limits
- **Spotify**: 1 request per second (handled by service)
- **Apple Music**: No strict limits (JWT cached)
- **Last.fm**: 5 requests per second per user
- **Discord Webhooks**: 30 requests per minute per webhook

### Caching Strategy
- Spotify tokens: 1 hour (auto-refresh)
- Apple Music JWT: 6 months
- Last.fm session: Permanent (until revoked)
- Job status: 24 hours (auto-cleanup)
- Rich Presence: 5 minutes

### Scalability
- Job queue: In-memory (replace with Bull/BullMQ for production)
- Redis: Clustered setup recommended for >10k users
- Track matching: Consider caching match results
- Webhook delivery: Implement retry logic with exponential backoff

---

## Security Best Practices

1. **Never log tokens/secrets** - Sanitize logs
2. **Use state parameter** - Prevent CSRF in OAuth flows
3. **Validate webhook sources** - Check Discord webhook ownership
4. **Rotate API keys** - Regularly update external service credentials
5. **Encrypt tokens at rest** - Consider encrypting Redis data
6. **Rate limit endpoints** - Prevent abuse
7. **Validate user ownership** - Ensure users only access their data
8. **Use HTTPS in production** - Encrypt all traffic

---

## Support and Contributing

For issues or feature requests, please see the main README.md.

Integration endpoints are designed to be extensible - follow the existing patterns to add new music services.

