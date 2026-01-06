# Environment Variables Configuration

This document lists all required environment variables for Streamify integrations.

## Core Settings

```env
# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/streamify

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
```

## Redis Configuration

Required for caching, job queues, and integration token storage.

```env
REDIS_ENABLED=true

# Option 1: Use REDIS_URL (takes precedence)
REDIS_URL=redis://username:password@host:port

# Option 2: Use individual components
REDIS_HOST=redis-14078.c334.asia-southeast2-1.gce.cloud.redislabs.com
REDIS_PORT=14078
REDIS_PASSWORD=your-redis-password
```

## Spotify Integration

Required for Spotify OAuth and playlist import.

```env
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback
```

**Setup Instructions:**
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Add redirect URI: `http://localhost:3001/api/spotify/callback`
4. Copy Client ID and Client Secret

## Apple Music Integration

Required for Apple Music playlist import.

```env
APPLE_MUSIC_TEAM_ID=your-apple-team-id
APPLE_MUSIC_KEY_ID=your-apple-music-key-id
APPLE_MUSIC_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
... your private key content ...
-----END PRIVATE KEY-----
```

**Setup Instructions:**
1. Go to https://developer.apple.com/account/resources/identifiers/list/musicId
2. Create a MusicKit Identifier
3. Generate a Music Key (download .p8 file)
4. Copy Team ID, Key ID, and private key content

## Last.fm Integration

Required for scrobbling and music statistics.

```env
LASTFM_API_KEY=your-lastfm-api-key
LASTFM_API_SECRET=your-lastfm-api-secret
```

**Setup Instructions:**
1. Go to https://www.last.fm/api/account/create
2. Create an API account
3. Copy API Key and Shared Secret

## Discord Integration (Optional)

Discord webhook URLs are stored per-user in the database, but you can set a default app ID.

```env
DISCORD_CLIENT_ID=your-discord-client-id
```

**Setup Instructions:**
1. Users configure their own Discord webhooks in Settings
2. Create webhook in Discord: Server Settings → Integrations → Webhooks → New Webhook
3. Copy webhook URL and paste in Streamify Settings

## Email Service (Optional)

Required for email notifications and password resets.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@streamify.com
```

## Lyrics Services (Optional)

```env
# Musixmatch API (optional, falls back to web scraping)
MUSIXMATCH_API_KEY=your-musixmatch-api-key

# Genius API (optional)
GENIUS_ACCESS_TOKEN=your-genius-access-token
```

## Complete Example `.env` File

```env
# Core
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/streamify

# JWT
JWT_SECRET=supersecretkey123
JWT_REFRESH_SECRET=supersecretrefreshkey456

# Redis
REDIS_ENABLED=true
REDIS_HOST=redis-14078.c334.asia-southeast2-1.gce.cloud.redislabs.com
REDIS_PORT=14078
REDIS_PASSWORD=yourredispassword

# Spotify
SPOTIFY_CLIENT_ID=abc123def456
SPOTIFY_CLIENT_SECRET=xyz789uvw012
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback

# Apple Music
APPLE_MUSIC_TEAM_ID=ABCD123456
APPLE_MUSIC_KEY_ID=XYZ789
APPLE_MUSIC_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----

# Last.fm
LASTFM_API_KEY=abc123def456ghi789
LASTFM_API_SECRET=xyz987uvw654rst321

# Discord (optional)
DISCORD_CLIENT_ID=123456789012345678

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@streamify.com

# Lyrics (optional)
MUSIXMATCH_API_KEY=your-musixmatch-key
GENIUS_ACCESS_TOKEN=your-genius-token
```

## Deployment Notes

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable Redis for production workloads
- [ ] Configure proper CORS origins in `FRONTEND_URL`
- [ ] Use SSL/TLS for Redis connection (rediss://)
- [ ] Set up email service for notifications
- [ ] Configure all OAuth redirect URIs for production domain

### Security Best Practices
1. Never commit `.env` files to version control
2. Use environment-specific `.env` files (`.env.local`, `.env.production`)
3. Rotate API keys and secrets regularly
4. Use secret management services (AWS Secrets Manager, Azure Key Vault) for production
5. Enable Redis AUTH and use strong passwords
6. Use SSL certificates for all external API connections

### Testing Configuration
For development/testing without external services:
- `REDIS_ENABLED=false` - Uses in-memory fallback
- Spotify/Apple Music/Last.fm endpoints will return errors but won't crash
- Lyrics will fall back to web scraping (no API keys needed)
