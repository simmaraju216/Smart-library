import pool from '../config/db.js';

export const issueBook = async ({ student_id, book_id, issue_date, due_date }) => {
  const [result] = await pool.query(
    'INSERT INTO transactions (student_id, book_id, issue_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
    [student_id, book_id, issue_date, due_date, 'issued']
  );
  return result.insertId;
};

export const returnBook = async ({ transaction_id, return_date }) => {
  await pool.query(
    'UPDATE transactions SET return_date = ?, return_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
    [return_date, 'returned', transaction_id]
  );
};

export const getTransactions = async () => {
  const [rows] = await pool.query(
    `SELECT t.*, s.name AS student_name, b.title AS book_title
     FROM transactions t
     JOIN students s ON s.id = t.student_id
     JOIN books b ON b.id = t.book_id
     ORDER BY t.id DESC`
  );
  return rows;
};

export const getStudentTransactions = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT t.*, b.title AS book_title
     FROM transactions t
     JOIN books b ON b.id = t.book_id
     WHERE t.student_id = ?
     ORDER BY t.id DESC`,
    [studentId]
  );
  return rows;
};

export const getOpenTransactionById = async (transactionId) => {
  const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ? AND status = ?', [transactionId, 'issued']);
  return rows[0];
};

export const getOpenTransactionByIdAndStudent = async (transactionId, studentId) => {
  const [rows] = await pool.query(
    'SELECT * FROM transactions WHERE id = ? AND student_id = ? AND status = ?',
    [transactionId, studentId, 'issued']
  );
  return rows[0];
};

export const getOverdueIssuedTransactions = async () => {
  const [rows] = await pool.query(
    `SELECT t.id, t.student_id, t.book_id, t.due_date, s.phone, s.name, b.title
     FROM transactions t
     JOIN students s ON s.id = t.student_id
     JOIN books b ON b.id = t.book_id
     WHERE t.status = 'issued' AND t.due_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
  );
  return rows;
};