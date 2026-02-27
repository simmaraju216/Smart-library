import { useState } from 'react';
import { issueBook } from '../../services/transactionService';

const IssueBook = () => {
  const [form, setForm] = useState({ student_id: '', book_id: '', due_date: '' });
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const data = await issueBook({ ...form, student_id: Number(form.student_id), book_id: Number(form.book_id) });
    setMsg(data.message);
  };

  return (
    <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
      <h2 className="font-semibold">Manual Issue Book</h2>
      <input className="w-full border p-2 rounded" placeholder="Student ID" onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Book ID" onChange={(e) => setForm({ ...form, book_id: e.target.value })} />
      <input className="w-full border p-2 rounded" type="date" onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
      <button className="bg-slate-900 text-white px-4 py-2 rounded">Issue</button>
      {msg && <p className="text-green-600">{msg}</p>}
    </form>
  );
};

export default IssueBook;