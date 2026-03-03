import express from 'express';
import {
  createRating,
  createSuggestion,
  listRatings,
  listSuggestions
} from '../controllers/feedbackController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/ratings', authMiddleware, allowRoles('student'), asyncHandler(createRating));
router.post('/suggestions', authMiddleware, allowRoles('student'), asyncHandler(createSuggestion));
router.get('/ratings', authMiddleware, allowRoles('admin'), asyncHandler(listRatings));
router.get('/suggestions', authMiddleware, allowRoles(['admin', 'student']), asyncHandler(listSuggestions));

export default router;