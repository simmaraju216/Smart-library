import { useState } from 'react';
import { askAI } from '../../services/aiService';

const AIChat = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi! I am your library assistant. You can ask general questions too.',
    },
  ]);

  const buildContextPrompt = (history, currentQuery) => {
    const recent = history.slice(-6);
    const context = recent
      .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.text}`)
      .join('\n');

    return `You are a helpful assistant. Continue this conversation naturally.\n\n${context}\nUser: ${currentQuery}`;
  };

  const submit = async (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmedQuery,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setQuery('');
    setError('');

    try {
      setIsLoading(true);
      const payload = buildContextPrompt(updatedHistory, trimmedQuery);
      const response = await askAI(payload);
      const replyText = response?.data || response?.reply || response?.message || 'No response from assistant.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: String(replyText),
        },
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to get AI response right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        text: 'Chat cleared. Ask me anything.',
      },
    ]);
    setError('');
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-white rounded shadow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">AI Chat</h2>
          <button
            type="button"
            onClick={clearChat}
            className="text-sm px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Clear Chat
          </button>
        </div>

        <div className="border rounded p-3 bg-slate-50 h-[420px] overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 text-slate-600">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <form className="bg-white p-4 rounded shadow space-y-2" onSubmit={submit}>
        <textarea
          className="w-full border p-2 rounded resize-none"
          rows={3}
          value={query}
          placeholder="Ask anything (library or general chat)..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="flex justify-end">
          <button
            className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-60"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;