import { useEffect, useState } from 'react';
import { getMyBooks } from '../../services/transactionService';

const MyBooks = () => {
  const [rows, setRows] = useState([]);

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  useEffect(() => {
    getMyBooks().then(setRows);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      {rows.map((r) => (
        <div key={r.id} className="py-2 border-b last:border-b-0">
          <div className="font-medium">Transaction ID: {r.id} | {r.book_title} - {r.status}</div>
          <div className="text-sm text-slate-600">Issued: {formatDateTime(r.created_at || r.issue_date)}</div>
          <div className="text-sm text-slate-600">Returned: {formatDateTime(r.return_at || r.return_date)}</div>
        </div>
      ))}
    </div>
  );
};

export default MyBooks;