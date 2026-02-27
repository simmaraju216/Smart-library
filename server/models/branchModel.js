import pool from '../config/db.js';

export const getAllBranches = async () => {
  const [rows] = await pool.query('SELECT id, name FROM branches ORDER BY id');
  return rows;
};

export const createBranch = async (name) => {
  const [result] = await pool.query('INSERT INTO branches (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
};

export const updateBranch = async (id, name) => {
  await pool.query('UPDATE branches SET name = ? WHERE id = ?', [name, id]);
  return { id, name };
};

export const deleteBranch = async (id) => {
  await pool.query('DELETE FROM branches WHERE id = ?', [id]);
  return { id };
};
