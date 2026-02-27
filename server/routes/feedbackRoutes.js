import express from 'express';
import {
  createRating,
  createSuggestion,
  listRatings,
  listSuggestions
} from '../controllers/feedbackController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

router.post('/ratings', authMiddleware, allowRoles('student'), createRating);
router.post('/suggestions', authMiddleware, allowRoles('student'), createSuggestion);
router.get('/ratings', authMiddleware, allowRoles('admin'), listRatings);
router.get('/suggestions', authMiddleware, allowRoles(['admin', 'student']), listSuggestions);

export default router;