import { useState } from 'react';
import api from '../../services/api';

const Suggestions = () => {
  const [suggestion, setSuggestion] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/feedback/suggestions', { suggestion });
    setMsg(data.message);
  };

  return (
    <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
      <textarea className="w-full border p-2 rounded" placeholder="Suggestion" onChange={(e) => setSuggestion(e.target.value)} />
      <button className="bg-slate-900 text-white px-4 py-2 rounded">Submit Suggestion</button>
      {msg && <p className="text-green-600">{msg}</p>}
    </form>
  );
};

export default Suggestions;