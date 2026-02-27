import express from 'express';
import { createBook, listBooks, deleteBook, updateBook } from '../controllers/bookController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();



router.get('/', authMiddleware, listBooks);
router.post('/', authMiddleware, allowRoles('admin'), createBook);
router.delete('/:id', authMiddleware, allowRoles('admin'), deleteBook);
router.patch('/:id', authMiddleware, allowRoles('admin'), updateBook);

export default router;