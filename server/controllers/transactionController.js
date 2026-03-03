import { updateBookAvailability } from '../models/bookModel.js';
import {
  getOpenTransactionByIdAndStudent,
  getStudentTransactions,
  getTransactions,
  issueBook,
  returnBook
} from '../models/transactionModel.js';
import { upsertLateFee } from '../models/fineModel.js';
import pool from '../config/db.js';

const DAILY_FINE = 5;

export const listTransactions = async (_req, res) => {
  const rows = await getTransactions();
  res.json(rows);
};

export const listMyBooks = async (req, res) => {
  const rows = await getStudentTransactions(req.user.id);
  res.json(rows);
};

export const issueBookByAdmin = async (req, res) => {
  const { student_id, book_id, due_date } = req.body;
  const issue_date = new Date().toISOString().slice(0, 10);
  const id = await issueBook({ student_id, book_id, issue_date, due_date });
  await updateBookAvailability(book_id, -1);
  res.status(201).json({ id, message: 'Book issued manually' });
};

export const returnBookByAdmin = async (req, res) => {
  const { transaction_id, student_id } = req.body;
  const parsedTransactionId = Number(transaction_id);
  const studentIdentifier = String(student_id || '').trim();

  if (!Number.isInteger(parsedTransactionId) || parsedTransactionId <= 0) {
    return res.status(400).json({ message: 'transaction_id must be a positive integer' });
  }

  if (!studentIdentifier) {
    return res.status(400).json({ message: 'student_id is required' });
  }

  const studentLookupQuery = /^\d+$/.test(studentIdentifier)
    ? 'SELECT id FROM students WHERE id = ? OR student_id = ? LIMIT 1'
    : 'SELECT id FROM students WHERE student_id = ? LIMIT 1';
  const studentLookupParams = /^\d+$/.test(studentIdentifier)
    ? [Number(studentIdentifier), studentIdentifier]
    : [studentIdentifier];

  const [[student]] = await pool.query(studentLookupQuery, studentLookupParams);
  if (!student) {
    return res.status(404).json({ message: `Student not found for ID: ${studentIdentifier}` });
  }

  const openTx = await getOpenTransactionByIdAndStudent(parsedTransactionId, student.id);
  if (!openTx) {
    return res.status(404).json({ message: 'Open transaction not found for the provided student ID and transaction ID' });
  }

  const return_date = new Date().toISOString().slice(0, 10);
  await returnBook({ transaction_id: parsedTransactionId, return_date });
  await updateBookAvailability(openTx.book_id, +1);

  const due = new Date(openTx.due_date);
  const returned = new Date(return_date);
  const ms = returned - due;
  const daysLate = ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
  const amount = daysLate * DAILY_FINE;
  if (daysLate > 0) {
    await upsertLateFee({ transaction_id: parsedTransactionId, days_late: daysLate, amount });
  }

  res.json({ message: 'Book returned', daysLate, fine: amount });
};