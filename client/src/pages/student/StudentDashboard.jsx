import { useEffect, useState } from "react";
import { getBooks } from "../../services/bookService";
import { getMyBooks, getMyFines } from "../../services/transactionService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  AlertTriangle,
  Bell,
  BookCheck,
  BookOpen,
  CheckCircle2,
  Clock3,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    books: 0,
    issued: 0,
    suggestions: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const parseDateOnly = (value) => {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const daysFromToday = (targetDate) => {
    if (!targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = targetDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const formatDate = (value) => {
    const parsed = parseDateOnly(value);
    if (!parsed) return "unknown date";
    return parsed.toLocaleDateString();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [books, myBooks, myFines, suggestions] = await Promise.all([
          getBooks(),
          getMyBooks(),
          getMyFines(),
          api.get("/feedback/suggestions").then((res) => res.data),
        ]);

        const issuedBooks = myBooks.filter((t) => t.status === "issued");
        const mySuggestions = suggestions.filter((s) => s.student_id === user.id);

        const nextNotifications = [
          {
            id: "dashboard-sync",
            type: "success",
            title: "Dashboard updated",
            message: "Your latest books and fine details are now synced.",
          },
        ];

        const overdueBooks = issuedBooks.filter((book) => {
          const days = daysFromToday(parseDateOnly(book.due_date));
          return days !== null && days < 0;
        });

        const dueSoonBooks = issuedBooks.filter((book) => {
          const days = daysFromToday(parseDateOnly(book.due_date));
          return days !== null && days >= 0 && days <= 2;
        });

        if (overdueBooks.length > 0) {
          nextNotifications.push({
            id: "overdue-books",
            type: "danger",
            title: "Overdue return reminder",
            message: `${overdueBooks.length} book(s) are overdue. Please return them as soon as possible.`,
          });
        }

        if (dueSoonBooks.length > 0) {
          nextNotifications.push({
            id: "due-soon",
            type: "warning",
            title: "Book due soon",
            message: `"${dueSoonBooks[0].book_title}" is due on ${formatDate(dueSoonBooks[0].due_date)}.${dueSoonBooks.length > 1 ? ` +${dueSoonBooks.length - 1} more.` : ""}`,
          });
        }

        const totalFine = myFines.reduce((sum, fine) => sum + Number(fine.amount || 0), 0);
        if (totalFine > 0) {
          nextNotifications.push({
            id: "pending-fines",
            type: "danger",
            title: "Pending fine alert",
            message: `You currently have Rs. ${totalFine} in late fines.`,
          });
        }

        if (issuedBooks.length === 0) {
          nextNotifications.push({
            id: "no-issued",
            type: "info",
            title: "No issued books",
            message: "You have no active issued books. Browse the catalog to borrow one.",
          });
        }

        if (mySuggestions.length > 0) {
          nextNotifications.push({
            id: "suggestions",
            type: "info",
            title: "Suggestions recorded",
            message: `You have submitted ${mySuggestions.length} suggestion(s).`,
          });
        }

        setStats({
          books: books.length,
          issued: issuedBooks.length,
          suggestions: mySuggestions.length,
        });
        setNotifications(nextNotifications);
        setLastUpdated(new Date());
        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load dashboard updates.");
        setNotifications([
          {
            id: "dashboard-error",
            type: "danger",
            title: "Could not load notifications",
            message: "Please refresh to retry dashboard updates.",
          },
        ]);
      }
    };
    fetchStats();
  }, [user]);

  const notificationStyles = {
    success: {
      container: "border-emerald-300 bg-emerald-50 text-emerald-900",
      icon: <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />,
    },
    warning: {
      container: "border-amber-300 bg-amber-50 text-amber-900",
      icon: <Clock3 size={18} className="text-amber-600 mt-0.5" />,
    },
    danger: {
      container: "border-red-300 bg-red-50 text-red-900",
      icon: <AlertTriangle size={18} className="text-red-600 mt-0.5" />,
    },
    info: {
      container: "border-sky-300 bg-sky-50 text-sky-900",
      icon: <Bell size={18} className="text-sky-600 mt-0.5" />,
    },
  };

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
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Bell size={18} /> Notifications
          </h3>
          <span className="text-xs text-slate-500">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Syncing..."}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.map((item) => {
            const current = notificationStyles[item.type] || notificationStyles.info;
            return (
              <div
                key={item.id}
                className={`border rounded-xl px-4 py-3 ${current.container}`}
              >
                <div className="flex items-start gap-3">
                  {current.icon}
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm opacity-90">{item.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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