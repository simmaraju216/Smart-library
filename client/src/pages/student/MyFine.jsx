import { useEffect, useState } from 'react';
import { getMyFines } from '../../services/transactionService';

const MyFine = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    getMyFines().then(setRows);
  }, []);
  return <div className="bg-white p-4 rounded shadow">{rows.map((r) => <div key={r.id}>Amount: {r.amount}</div>)}</div>;
};

export default MyFine;