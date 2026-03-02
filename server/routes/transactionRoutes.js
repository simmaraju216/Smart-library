import express from 'express';
import {
  listMyBooks,
  listTransactions,
  returnBookByAdmin
} from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/auth.js';
import { allowRoles } from '../middleware/role.js';
import { requireFields } from '../middleware/validation.js';
import { issueBook } from '../models/transactionModel.js';
import { updateBookAvailability } from '../models/bookModel.js';
import pool from '../config/db.js';
import { sendSMS } from '../services/externalServices.js';

const router = express.Router();

router.get('/', authMiddleware, allowRoles(['admin', 'student']), listTransactions);
router.get('/my', authMiddleware, allowRoles('student'), listMyBooks);
router.post('/issue', authMiddleware, allowRoles('admin'), requireFields(['student_id', 'book_id', 'due_date']), async (req, res, next) => {
  try {
    const { student_id, book_id, due_date } = req.body;
    const issue_date = new Date().toISOString().slice(0, 10);

    const id = await issueBook({ student_id, book_id, issue_date, due_date });
    await updateBookAvailability(book_id, -1);

    const [[student]] = await pool.query('SELECT phone, name FROM students WHERE id = ?', [student_id]);
    const [[book]] = await pool.query('SELECT title FROM books WHERE id = ?', [book_id]);

    if (student?.phone) {
      const smsMessage = `Hi ${student.name || 'Student'}, your book "${book?.title || 'Library Book'}" is issued. Due date: ${due_date}.`;
      sendSMS(student.phone, smsMessage).catch((smsError) => {
        console.error('[SMS] Failed after issue:', smsError.message);
      });
    } else {
      console.log(`[SMS] Skipped: no phone found for student_id=${student_id}`);
    }

    return res.status(201).json({ id, message: 'Book issued manually' });
  } catch (error) {
    return next(error);
  }
});
router.post('/return', authMiddleware, allowRoles('admin'), returnBookByAdmin);

export default router;