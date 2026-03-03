import { useState } from 'react';
import { returnBook } from '../../services/transactionService';

const ReturnBook = () => {
  const [studentId, setStudentId] = useState(localStorage.getItem('latestIssuedStudentId') || '');
  const [transactionId, setTransactionId] = useState(localStorage.getItem('latestIssuedTransactionId') || '');
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await returnBook({
        student_id: String(studentId).trim(),
        transaction_id: Number(transactionId)
      });
      setResult(data);
      setMsg(data.message || 'Book returned successfully');
    } catch (error) {
      setResult(null);
      setMsg(error.response?.data?.message || 'Failed to return book');
    }
  };

  return (
    <div className="space-y-3">
      <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
        <h2 className="font-semibold">Return Book</h2>
        <input className="w-full border p-2 rounded" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
        <button className="bg-slate-900 text-white px-4 py-2 rounded">Return</button>
        {msg && <p className="text-slate-700">{msg}</p>}
      </form>
      {result && <div className="bg-white p-3 rounded shadow">Fine: {result.fine} | Days Late: {result.daysLate}</div>}
    </div>
  );
};

export default ReturnBook;