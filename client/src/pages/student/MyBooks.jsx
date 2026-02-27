import { useEffect, useState } from 'react';
import { getMyBooks } from '../../services/transactionService';

const MyBooks = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    getMyBooks().then(setRows);
  }, []);
  return <div className="bg-white p-4 rounded shadow">{rows.map((r) => <div key={r.id}>{r.book_title} - {r.status}</div>)}</div>;
};

export default MyBooks;