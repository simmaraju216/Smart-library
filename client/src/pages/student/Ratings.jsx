import { useState } from 'react';
import api from '../../services/api';

const Ratings = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/feedback/ratings', { rating: Number(rating), comment });
    setMsg(data.message);
  };

  return (
    <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
      <input className="w-full border p-2 rounded" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
      <textarea className="w-full border p-2 rounded" placeholder="Comment" onChange={(e) => setComment(e.target.value)} />
      <button className="bg-slate-900 text-white px-4 py-2 rounded">Submit Rating</button>
      {msg && <p className="text-green-600">{msg}</p>}
    </form>
  );
};

export default Ratings;