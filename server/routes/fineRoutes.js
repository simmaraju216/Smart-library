import express from 'express';
import { listFines, listMyFines } from '../controllers/fineController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles('admin'), listFines);
router.get('/my', authMiddleware, allowRoles('student'), listMyFines);

export default router;