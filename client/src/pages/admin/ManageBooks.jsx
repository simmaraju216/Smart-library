import { useEffect, useState } from 'react';
import { createBook, getBooks, updateBook, deleteBook } from '../../services/bookService';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', quantity: 1 });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = async () => setBooks(await getBooks());
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await createBook({ ...form, quantity: Number(form.quantity) });
    setForm({ title: '', author: '', quantity: 1 });
    load();
  };

  // Book edit handlers
  const startEdit = (book) => {
    setEditId(book.id);
    setEditForm({ ...book });
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };
  const saveEdit = async () => {
    await updateBook(editId, {
      title: editForm.title,
      author: editForm.author,
      quantity: Number(editForm.quantity),
      available_quantity: Number(editForm.quantity)
    });
    setEditId(null);
    setEditForm({});
    load();
  };
  const removeBook = async (id) => {
    await deleteBook(id);
    load();
  };

  return (
    <div className="space-y-4">
      <form className="bg-white p-4 rounded shadow space-y-2" onSubmit={submit}>
        <h2 className="font-semibold">Manage Books</h2>
        <input
          className="w-full border p-2 rounded"
          placeholder="Book ID (optional/manual)"
          type="number"
          value={form.id || ''}
          onChange={e => setForm({ ...form, id: e.target.value })}
        />
        <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <input className="w-full border p-2 rounded" type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
        <button className="bg-slate-900 text-white px-4 py-2 rounded">Add Book</button>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b bg-slate-50">
              <th className="py-2 px-2">ID</th>
              <th className="py-2 px-2">Title</th>
              <th className="py-2 px-2">Author</th>
              <th className="py-2 px-2">Available</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr className="border-b" key={book.id}>
                <td className="py-2 px-2">{book.id}</td>
                <td className="py-2 px-2">
                  {editId === book.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  ) : (
                    book.title
                  )}
                </td>
                <td className="py-2 px-2">
                  {editId === book.id ? (
                    <input
                      className="border p-1 rounded"
                      value={editForm.author}
                      onChange={e => setEditForm({ ...editForm, author: e.target.value })}
                    />
                  ) : (
                    book.author
                  )}
                </td>
                <td className="py-2 px-2">
                  {editId === book.id ? (
                    <input
                      className="border p-1 rounded"
                      type="number"
                      min="1"
                      value={editForm.quantity}
                      onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
                    />
                  ) : (
                    book.available_quantity
                  )}
                </td>
                <td className="py-2 px-2 space-x-2">
                  {editId === book.id ? (
                    <>
                      <button className="px-2 py-1 text-xs bg-green-500 text-white rounded" onClick={saveEdit} type="button">Save</button>
                      <button className="px-2 py-1 text-xs bg-gray-400 text-white rounded" onClick={cancelEdit} type="button">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded" onClick={() => startEdit(book)} type="button">Edit</button>
                      <button className="px-2 py-1 text-xs bg-red-500 text-white rounded" onClick={() => removeBook(book.id)} type="button">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBooks;