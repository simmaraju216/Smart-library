import { useEffect, useState } from 'react';
import { getAllFines } from '../../services/transactionService';

const LateFee = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    getAllFines().then(setRows);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2">Late Fee Records</h2>
      {rows.map((r) => <div className="border-b py-2" key={r.id}>TX#{r.transaction_id} - Amount: {r.amount}</div>)}
    </div>
  );
};

export default LateFee;