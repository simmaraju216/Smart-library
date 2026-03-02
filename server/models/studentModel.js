import pool from '../config/db.js';

export const getAllStudents = async () => {
  const [rows] = await pool.query('SELECT id, name, email, phone, batch_id, branch_id, year, role, student_id FROM students ORDER BY id DESC');
  return rows;
};

export const createStudent = async ({ student_id, name, email, phone, passwordHash, batch_id, branch_id, year }) => {
  const [result] = await pool.query(
    'INSERT INTO students (student_id, name, email, phone, password, batch_id, branch_id, year, role, first_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [student_id || null, name, email, phone, passwordHash, batch_id, branch_id, year, 'student', 1]
  );
  return result.insertId;
};

export const updateStudentRoleById = async (id, role) => {
  const [result] = await pool.query('UPDATE students SET role = ? WHERE id = ?', [role, id]);
  return result.affectedRows;
};

export const deleteStudentById = async (id) => {
  const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
  return result.affectedRows;
};

// Update student details (name, year, student_id, etc)
export const updateStudentById = async (id, data) => {
  // Only allow certain fields to be updated
  const fields = ['name', 'year', 'student_id', 'email'];
  const updates = [];
  const values = [];
  for (const key of fields) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (updates.length === 0) return 0;
  values.push(id);
  const [result] = await pool.query(
    `UPDATE students SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows;
};