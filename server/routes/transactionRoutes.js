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
    const studentIdentifier = String(student_id || '').trim();
    const parsedBookId = Number(book_id);

    if (!studentIdentifier) {
      return res.status(400).json({ message: 'student_id is required' });
    }

    if (!Number.isInteger(parsedBookId) || parsedBookId <= 0) {
      return res.status(400).json({ message: 'book_id must be a positive integer' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(due_date || ''))) {
      return res.status(400).json({ message: 'due_date must be in YYYY-MM-DD format' });
    }

    const dueDateObj = new Date(`${due_date}T00:00:00Z`);
    if (Number.isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ message: 'due_date is invalid' });
    }

    const issue_date = new Date().toISOString().slice(0, 10);

    const studentLookupQuery = /^\d+$/.test(studentIdentifier)
      ? 'SELECT id, phone, name, student_id FROM students WHERE id = ? OR student_id = ? LIMIT 1'
      : 'SELECT id, phone, name, student_id FROM students WHERE student_id = ? LIMIT 1';
    const studentLookupParams = /^\d+$/.test(studentIdentifier)
      ? [Number(studentIdentifier), studentIdentifier]
      : [studentIdentifier];

    const [[student]] = await pool.query(studentLookupQuery, studentLookupParams);
    if (!student) {
      return res.status(404).json({ message: `Student not found for ID: ${studentIdentifier}` });
    }

    const [[book]] = await pool.query('SELECT id, title, available_quantity FROM books WHERE id = ?', [parsedBookId]);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (Number(book.available_quantity) <= 0) {
      return res.status(409).json({ message: 'Book is out of stock' });
    }

    const id = await issueBook({ student_id: student.id, book_id: parsedBookId, issue_date, due_date });
    await updateBookAvailability(parsedBookId, -1);

    if (student?.phone) {
      const smsMessage = `Hi ${student.name || 'Student'}, your book "${book?.title || 'Library Book'}" is issued. Due date: ${due_date}.`;
      sendSMS(student.phone, smsMessage).catch((smsError) => {
        console.error('[SMS] Failed after issue:', smsError.message);
      });
    } else {
      console.log(`[SMS] Skipped: no phone found for student_id=${student.student_id || student.id}`);
    }

    return res.status(201).json({ id, transaction_id: id, message: 'Book issued manually' });
  } catch (error) {
    return next(error);
  }
});
router.post('/return', authMiddleware, allowRoles('admin'), requireFields(['student_id', 'transaction_id']), returnBookByAdmin);

export default router;