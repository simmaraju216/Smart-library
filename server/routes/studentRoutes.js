import express from 'express';
import { addStudent, listStudents, removeStudent, setStudentRole } from '../controllers/studentController.js';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { sendSMS } from '../services/externalServices.js';
import { updateStudent } from '../controllers/studentController.js';

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

router.post('/notify', authMiddleware, allowRoles('admin'), async (req, res, next) => {
	try {
		const studentIdentifier = String(req.body.student_id || '').trim();
		const message = String(req.body.message || '').trim();
		const sendAll = Boolean(req.body.send_all);

		if (!sendAll && !studentIdentifier) {
			return res.status(400).json({ message: 'student_id is required when send_all is false.' });
		}

		if (message.length < 5) {
			return res.status(400).json({ message: 'Message should be at least 5 characters.' });
		}

		if (message.length > 500) {
			return res.status(400).json({ message: 'Message should not exceed 500 characters.' });
		}


		if (sendAll) {
			const [rows] = await pool.query(
				"SELECT id, name, phone, student_id FROM students WHERE role = 'student' AND phone IS NOT NULL AND phone <> ''"
			);

			if (!rows.length) {
				return res.status(404).json({ message: 'No students with phone numbers found.' });
			}

			const settled = await Promise.allSettled(
				rows.map((student) => {
					const smsText = `Hi ${student.name || 'Student'}, ${message}`;
					return sendSMS(student.phone, smsText);
				})
			);

			const sent = settled.filter(
				(item) => item.status === 'fulfilled' && item.value?.success
			).length;
			const failed = rows.length - sent;

			return res.json({
				success: failed === 0,
				message: `Broadcast complete. Sent: ${sent}, Failed: ${failed}.`,
				total: rows.length,
				sent,
				failed
			});
		}

		const lookupQuery = /^\d+$/.test(studentIdentifier)
			? 'SELECT id, name, phone, student_id FROM students WHERE id = ? OR student_id = ? LIMIT 1'
			: 'SELECT id, name, phone, student_id FROM students WHERE student_id = ? LIMIT 1';
		const lookupParams = /^\d+$/.test(studentIdentifier)
			? [Number(studentIdentifier), studentIdentifier]
			: [studentIdentifier];

		const [[student]] = await pool.query(lookupQuery, lookupParams);

		if (!student) {
			return res.status(404).json({ message: 'Student not found.' });
		}

		if (!student.phone) {
			return res.status(400).json({ message: 'Selected student does not have a phone number.' });
		}

		const smsText = `Hi ${student.name || 'Student'}, ${message}`;
		const smsResult = await sendSMS(student.phone, smsText);

		if (!smsResult?.success) {
			return res.status(502).json({
				message: 'Notification could not be sent via SMS.',
				details: smsResult?.error || 'Unknown provider error.'
			});
		}

		return res.json({
			success: true,
			message: `Notification sent to ${student.name || 'student'}.`,
			provider: smsResult.provider || 'unknown'
		});
	} catch (error) {
		return next(error);
	}
});

// Batch list for dropdown
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
router.patch('/:id', authMiddleware, allowRoles('admin'), updateStudent);
router.patch('/:id/role', authMiddleware, allowRoles('admin'), setStudentRole);
router.delete('/:id', authMiddleware, allowRoles('admin'), removeStudent);

export default router;