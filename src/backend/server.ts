/**
 * Main Server File
 * Express server setup with all routes and middleware
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { ApiResponse } from './utils/helpers';
import { authenticateToken, optionalAuth } from './middleware/authMiddleware';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import musicRoutes from './routes/musicRoutes';
import advancedMusicRoutes from './routes/advancedMusicRoutes';
import searchRoutes from './routes/searchRoutes';
import userRoutes from './routes/userRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import playlistRoutes from './routes/playlistRoutes';
import lyricsRoutes from './routes/lyricsRoutes';
import socialRoutes from './routes/socialRoutes';
import spotifyRoutes from './routes/spotifyRoutes';
import realtimeRoutes from './routes/realtimeRoutes';
import appleMusicRoutes from './routes/appleMusicRoutes';
import lastFmRoutes from './routes/lastFmRoutes';
import discordRoutes from './routes/discordRoutes';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS - support multiple origins from env
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json(
    ApiResponse.success('Server is healthy', {
      timestamp: new Date(),
      uptime: process.uptime(),
    })
  );
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json(
    ApiResponse.success('Streamify API v2.0', {
      status: 'online',
      endpoints: 56,
      docs: '/api',
      health: '/health'
    })
  );
});

// ==================== ROUTES ====================

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/music/v2', advancedMusicRoutes); // Advanced reverse engineered API
app.use('/api/search', searchRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/applemusic', appleMusicRoutes);
app.use('/api/lastfm', lastFmRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/realtime', realtimeRoutes);

// Protected routes
app.use('/api/user', authenticateToken, userRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json(
    ApiResponse.error('Route not found', 404, {
      path: req.path,
      method: req.method,
    })
  );
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${error.message}`, error);

  const statusCode = (error as any).statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json(
    ApiResponse.error(message, statusCode)
  );
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
