import { useState } from 'react';
import { returnBook } from '../../services/transactionService';

const ReturnBook = () => {
  const [transactionId, setTransactionId] = useState('');
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const data = await returnBook({ transaction_id: Number(transactionId) });
    setResult(data);
  };

  return (
    <div className="space-y-3">
      <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
        <h2 className="font-semibold">Return Book</h2>
        <input className="w-full border p-2 rounded" placeholder="Transaction ID" onChange={(e) => setTransactionId(e.target.value)} />
        <button className="bg-slate-900 text-white px-4 py-2 rounded">Return</button>
      </form>
      {result && <div className="bg-white p-3 rounded shadow">Fine: {result.fine} | Days Late: {result.daysLate}</div>}
    </div>
  );
};

export default ReturnBook;