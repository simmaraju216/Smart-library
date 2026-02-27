import express from 'express';
import {
  listBranches,
  addBranch,
  editBranch,
  removeBranch
} from '../controllers/branchController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles('admin'), listBranches);
router.post('/', authMiddleware, allowRoles('admin'), addBranch);
router.patch('/:id', authMiddleware, allowRoles('admin'), editBranch);
router.delete('/:id', authMiddleware, allowRoles('admin'), removeBranch);

export default router;
