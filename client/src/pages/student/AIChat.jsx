import { useState } from 'react';
import { askAI } from '../../services/aiService';

const AIChat = () => {
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const data = await askAI(query);
    setReply(data.reply);
  };

  return (
    <div className="space-y-3">
      <form className="bg-white p-4 rounded shadow max-w-xl space-y-2" onSubmit={submit}>
        <textarea className="w-full border p-2 rounded" placeholder="Ask library assistant" onChange={(e) => setQuery(e.target.value)} />
        <button className="bg-slate-900 text-white px-4 py-2 rounded">Ask</button>
      </form>
      {reply && <div className="bg-white p-4 rounded shadow">{reply}</div>}
    </div>
  );
};

export default AIChat;