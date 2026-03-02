import express from 'express';
import { addStudent, listStudents, removeStudent, setStudentRole } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles('admin'), listStudents);
router.post('/', authMiddleware, allowRoles('admin'), addStudent);
router.get('/dashboard-stats', authMiddleware, allowRoles('admin'), async (_req, res) => {
	try {
		const [[stats]] = await pool.query(
			`SELECT
				(SELECT COUNT(*) FROM students WHERE role = 'student') AS students,
				(SELECT COUNT(*) FROM books) AS books,
				(SELECT COUNT(*) FROM transactions WHERE status = 'issued') AS issued,
				(SELECT COUNT(*) FROM suggestions) AS suggestions`
		);
		res.json(stats);
	} catch (error) {
		console.error('[Dashboard Stats] Failed to fetch stats:', error.message);
		res.status(500).json({ message: 'Failed to fetch dashboard stats' });
	}
});
// Batch list for dropdown
import pool from '../config/db.js';
router.get('/batches', authMiddleware, allowRoles('admin'), async (_req, res) => {
	const [rows] = await pool.query('SELECT id, name FROM batches ORDER BY id');
	res.json(rows);
});
// Add batch
router.post('/batches', authMiddleware, allowRoles('admin'), async (req, res) => {
       const { name } = req.body;
       if (!name) return res.status(400).json({ error: 'Name is required' });
       try {
	       const [result] = await pool.query('INSERT INTO batches (name) VALUES (?)', [name]);
	       res.status(201).json({ id: result.insertId, name });
       } catch (err) {
	       if (err.code === 'ER_DUP_ENTRY') {
		       return res.status(409).json({ error: 'Batch name already exists' });
	       }
	       res.status(500).json({ error: 'Database error', details: err.message });
       }
});
import { updateStudent } from '../controllers/studentController.js';
router.patch('/:id', authMiddleware, allowRoles('admin'), updateStudent);
router.patch('/:id/role', authMiddleware, allowRoles('admin'), setStudentRole);
router.delete('/:id', authMiddleware, allowRoles('admin'), removeStudent);

export default router;