import express from 'express';
import { askAI } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/ask', authMiddleware, askAI);

export default router;