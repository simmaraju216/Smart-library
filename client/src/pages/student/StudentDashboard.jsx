import { useEffect, useState } from "react";
import { getBooks } from "../../services/bookService";
import { getTransactions } from "../../services/transactionService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, BookCheck, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    books: 0,
    issued: 0,
    suggestions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [books, transactions, suggestions] = await Promise.all([
          getBooks(),
          getTransactions(),
          api.get("/feedback/suggestions").then((res) => res.data),
        ]);

        setStats({
          books: books.length,
          issued: transactions.filter(
            (t) => t.student_id === user.id && t.status === "issued"
          ).length,
          suggestions: suggestions.filter(
            (s) => s.student_id === user.id
          ).length,
        });
      } catch {}
    };
    fetchStats();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-10">

      {/* Greeting Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          Welcome back, {user?.name} 👋
        </h2>
        <p className="text-slate-500 mt-2">
          Explore your library activities and manage your books easily.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Books */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-6 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold">{stats.books}</div>
              <div className="text-sm opacity-90 mt-1">Total Books</div>
            </div>
            <BookOpen size={36} className="opacity-80" />
          </div>
        </div>

        {/* Issued Books */}
        <div className="relative bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl shadow-xl p-6 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold">{stats.issued}</div>
              <div className="text-sm opacity-90 mt-1">Books Issued</div>
            </div>
            <BookCheck size={36} className="opacity-80" />
          </div>
        </div>

        {/* Suggestions */}
        <div className="relative bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl shadow-xl p-6 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl font-bold">{stats.suggestions}</div>
              <div className="text-sm opacity-90 mt-1">My Suggestions</div>
            </div>
            <MessageSquare size={36} className="opacity-80" />
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          ⚡ Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/student/available-books" className="bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition shadow flex items-center justify-center">
            📚 Browse Available Books
          </Link>

          <Link to="/student/suggestions" className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition shadow flex items-center justify-center">
            ✍ Submit Suggestion
          </Link>

          <Link to="/student/my-books" className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition shadow flex items-center justify-center">
            📖 View My Books
          </Link>

          <Link to="/student/my-fine" className="bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition shadow flex items-center justify-center">
            💰 Check My Fines
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          📌 Student Info
        </h3>

        <ul className="space-y-2 text-slate-600">
          <li>✔ View available books and track your issued books</li>
          <li>✔ Submit suggestions and feedback to admin</li>
          <li>✔ Check your fines and return deadlines</li>
          <li>✔ Use AI Chat for assistance</li>
        </ul>
      </div>

    </div>
  );
};

export default StudentDashboard;