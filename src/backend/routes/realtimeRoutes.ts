/**
 * Realtime routes (SSE)
 */

import { Router } from 'express';
import { optionalAuth } from '../middleware/authMiddleware';
import RealtimeService from '../services/RealtimeService';

const router = Router();

router.get('/stream', optionalAuth, (req, res) => {
  RealtimeService.register(res);
});

export default router;
