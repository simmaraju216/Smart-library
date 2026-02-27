import express from 'express';
import {
  issueBookByAdmin,
  listMyBooks,
  listTransactions,
  returnBookByAdmin
} from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles(['admin', 'student']), listTransactions);
router.get('/my', authMiddleware, allowRoles('student'), listMyBooks);
router.post('/issue', authMiddleware, allowRoles('admin'), issueBookByAdmin);
router.post('/return', authMiddleware, allowRoles('admin'), returnBookByAdmin);

export default router;