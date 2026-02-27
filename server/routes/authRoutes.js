import express from 'express';
import { login, resetPassword } from '../controllers/authController.js';
import { requireFields } from '../middleware/validation.js';

const router = express.Router();

router.post('/login', requireFields(['email', 'password']), login);
router.post('/reset-password', requireFields(['userId', 'newPassword']), resetPassword);

export default router;