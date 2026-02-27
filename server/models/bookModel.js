import pool from '../config/db.js';

// Update book details
export const updateBookById = async (id, data) => {
  const fields = ['title', 'author', 'quantity', 'available_quantity'];
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
    `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows;
};

// Delete book by id
export const deleteBookById = async (id) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
  return result.affectedRows;
};

export const getBooks = async () => {
  const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC');
  return rows;
};

export const addBook = async ({ title, author, quantity, available_quantity }) => {
  const [result] = await pool.query(
    'INSERT INTO books (title, author, quantity, available_quantity) VALUES (?, ?, ?, ?)',
    [title, author, quantity, available_quantity]
  );
  return result.insertId;
};

export const updateBookAvailability = async (bookId, delta) => {
  await pool.query('UPDATE books SET available_quantity = available_quantity + ? WHERE id = ?', [delta, bookId]);
};