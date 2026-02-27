
import { useAuth } from "../../context/AuthContext";
import { Users, BookOpen, BookCheck, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStudents } from "../../services/studentService";
import { getBooks } from "../../services/bookService";
import { getTransactions } from "../../services/transactionService";
import api from "../../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    books: 0,
    issued: 0,
    suggestions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, books, transactions, suggestions] = await Promise.all([
          getStudents(),
          getBooks(),
          getTransactions(),
          api.get("/feedback/suggestions").then(res => res.data),
        ]);
        setStats({
          students: students.filter(s => s.role === "student").length,
          books: books.length,
          issued: transactions.filter(t => t.status === "issued").length,
          suggestions: suggestions.length,
        });
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats.students,
      icon: <Users size={28} />,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Total Books",
      value: stats.books,
      icon: <BookOpen size={28} />,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Books Issued",
      value: stats.issued,
      icon: <BookCheck size={28} />,
      color: "from-orange-500 to-amber-600",
    },
    {
      label: "Suggestions",
      value: stats.suggestions,
      icon: <MessageSquare size={28} />,
      color: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 md:px-8 space-y-8 h-full overflow-auto">
      {/* Welcome Section */}
      <div className="pt-2">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
          Welcome back, {user?.name || "Admin"} 👋
        </h2>
        <p className="text-slate-500 mt-1 md:mt-2 text-sm md:text-base">
          Here’s what’s happening in your Smart Library today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-gradient-to-r ${s.color} text-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col justify-between min-w-0`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
                <div className="text-xs md:text-sm opacity-90 mt-1">{s.label}</div>
              </div>
              <div className="opacity-80">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-slate-800">
          ⚡ Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <button
            className="bg-slate-900 text-white py-2 md:py-3 rounded-lg hover:bg-slate-800 transition shadow text-sm md:text-base"
            onClick={() => navigate('/admin/manage-students')}
          >
            ➕ Add New Student
          </button>

          <button
            className="bg-blue-600 text-white py-2 md:py-3 rounded-lg hover:bg-blue-700 transition shadow text-sm md:text-base"
            onClick={() => navigate('/admin/manage-books')}
          >
            📚 Add New Book
          </button>

          <button
            className="bg-green-600 text-white py-2 md:py-3 rounded-lg hover:bg-green-700 transition shadow text-sm md:text-base"
            onClick={() => navigate('/admin/issue-book')}
          >
            🔄 Issue Book
          </button>

          <button
            className="bg-red-500 text-white py-2 md:py-3 rounded-lg hover:bg-red-600 transition shadow text-sm md:text-base"
            onClick={() => navigate('/admin/late-fee')}
          >
            💰 View Late Fees
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-slate-800">
          📌 Admin Responsibilities
        </h3>

        <ul className="space-y-2 text-slate-600 text-xs md:text-base">
          <li>✔ Manage students, books, batches, and branches</li>
          <li>✔ Issue and return books manually</li>
          <li>✔ Review late fees, ratings, and suggestions</li>
          <li>✔ Monitor overall library system activity</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
