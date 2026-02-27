import pool from '../config/db.js';

export const addRating = async ({ student_id, rating, comment }) => {
  const [result] = await pool.query('INSERT INTO ratings (student_id, rating, comment) VALUES (?, ?, ?)', [student_id, rating, comment]);
  return result.insertId;
};

export const addSuggestion = async ({ student_id, suggestion }) => {
  const [result] = await pool.query('INSERT INTO suggestions (student_id, suggestion) VALUES (?, ?)', [student_id, suggestion]);
  return result.insertId;
};

export const getRatings = async () => {
  const [rows] = await pool.query(
    `SELECT r.*, s.name AS student_name
     FROM ratings r
     JOIN students s ON s.id = r.student_id
     ORDER BY r.id DESC`
  );
  return rows;
};

export const getSuggestions = async () => {
  const [rows] = await pool.query(
    `SELECT sg.*, s.name AS student_name
     FROM suggestions sg
     JOIN students s ON s.id = sg.student_id
     ORDER BY sg.id DESC`
  );
  return rows;
};