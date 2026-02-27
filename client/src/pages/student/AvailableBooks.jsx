import { useEffect, useState } from 'react';
import { getBooks } from '../../services/bookService';
import Navbar from '../../components/Navbar';

const AvailableBooks = () => {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getBooks().then((data) => {
      setBooks(data);
      setFiltered(data);
    });
  }, []);

  const handleSearch = (query) => {
    setSearch(query);
    setFiltered(
      books.filter(
        (b) =>
          b.available_quantity > 0 &&
          b.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search books by title..."
          className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 shadow"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between border border-slate-100">
            <div className="font-bold text-lg text-slate-800 mb-1">{b.title}</div>
            <div className="text-slate-600 text-sm mb-2">by {b.author}</div>
            <div className="text-xs text-green-700 font-semibold">Available: {b.available_quantity}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableBooks;