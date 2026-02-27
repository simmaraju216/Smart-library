import pool from '../config/db.js';

export const upsertLateFee = async ({ transaction_id, days_late, amount }) => {
  await pool.query(
    `INSERT INTO late_fee (transaction_id, days_late, amount)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE days_late = VALUES(days_late), amount = VALUES(amount)`,
    [transaction_id, days_late, amount]
  );
};

export const getAllFines = async () => {
  const [rows] = await pool.query(
    `SELECT lf.*, t.student_id, t.book_id
     FROM late_fee lf
     JOIN transactions t ON t.id = lf.transaction_id
     ORDER BY lf.id DESC`
  );
  return rows;
};

export const getFinesByStudent = async (studentId) => {
  const [rows] = await pool.query(
    `SELECT lf.*
     FROM late_fee lf
     JOIN transactions t ON t.id = lf.transaction_id
     WHERE t.student_id = ?
     ORDER BY lf.id DESC`,
    [studentId]
  );
  return rows;
};