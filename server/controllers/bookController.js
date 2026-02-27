import { addBook, getBooks, deleteBookById, updateBookById } from '../models/bookModel.js';
// Update book
export const updateBook = async (req, res) => {
  const bookId = Number(req.params.id);
  const allowedFields = ['title', 'author', 'quantity', 'available_quantity'];
  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  }
  // If quantity is updated and available_quantity is not provided, set available_quantity = quantity
  if (data.quantity !== undefined && data.available_quantity === undefined) {
    data.available_quantity = data.quantity;
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  const affectedRows = await updateBookById(bookId, data);
  if (!affectedRows) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json({ message: 'Book updated' });
};
// Delete book
export const deleteBook = async (req, res) => {
  const bookId = Number(req.params.id);
  const affectedRows = await deleteBookById(bookId);
  if (!affectedRows) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json({ message: 'Book deleted' });
};

export const listBooks = async (_req, res) => {
  const rows = await getBooks();
  res.json(rows);
};

export const createBook = async (req, res) => {
  const { title, author, quantity } = req.body;
  const id = await addBook({ title, author, quantity, available_quantity: quantity });
  res.status(201).json({ id, message: 'Book added' });
};