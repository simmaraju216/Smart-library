import { useState } from 'react';
import { issueBook } from '../../services/transactionService';

const IssueBook = () => {
  const [form, setForm] = useState({ student_id: '', book_id: '', due_date: '' });
  const [msg, setMsg] = useState('');
  const [issuedTransactionId, setIssuedTransactionId] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await issueBook({ ...form, student_id: String(form.student_id).trim(), book_id: Number(form.book_id) });
      const txId = data.transaction_id || data.id;
      setIssuedTransactionId(txId ? String(txId) : '');
      if (txId) {
        localStorage.setItem('latestIssuedTransactionId', String(txId));
      }
      localStorage.setItem('latestIssuedStudentId', String(form.student_id).trim());
      setMsg(data.message || 'Book issued successfully');
    } catch (error) {
      setIssuedTransactionId('');
      setMsg(error.response?.data?.message || 'Failed to issue book');
    }
  };

  return (
    <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
      <h2 className="font-semibold">Manual Issue Book</h2>
      <input className="w-full border p-2 rounded" placeholder="Student ID" onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
      <input className="w-full border p-2 rounded" placeholder="Book ID" onChange={(e) => setForm({ ...form, book_id: e.target.value })} />
      <input className="w-full border p-2 rounded" type="date" onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
      <button className="bg-slate-900 text-white px-4 py-2 rounded">Issue</button>
      {msg && <p className="text-slate-700">{msg}</p>}
      {issuedTransactionId && (
        <p className="text-slate-900 font-medium">Transaction ID: {issuedTransactionId}</p>
      )}
    </form>
  );
};

export default IssueBook;