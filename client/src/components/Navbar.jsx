import { useAuth } from "../context/AuthContext";
import { AlertTriangle, Bell, Clock3, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyBooks, getMyFines } from "../services/transactionService";
import api from "../services/api";

const Navbar = ({ toggleSidebar, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const loadNotifications = async () => {
    if (user?.role !== "student") return;

    try {
      setLoadingNotifications(true);
      const [myBooks, myFines, suggestions] = await Promise.all([
        getMyBooks(),
        getMyFines(),
        api.get("/feedback/suggestions").then((res) => res.data),
      ]);

      const issuedBooks = myBooks.filter((t) => t.status === "issued");
      const mySuggestions = suggestions.filter((s) => s.student_id === user.id);

      const overdueBooks = issuedBooks.filter((book) => {
        const days = daysFromToday(parseDateOnly(book.due_date));
        return days !== null && days < 0;
      });

      const dueSoonBooks = issuedBooks.filter((book) => {
        const days = daysFromToday(parseDateOnly(book.due_date));
        return days !== null && days >= 0 && days <= 2;
      });

      const totalFine = myFines.reduce((sum, fine) => sum + Number(fine.amount || 0), 0);
      const nextNotifications = [];

      if (overdueBooks.length > 0) {
        nextNotifications.push({
          id: "overdue",
          type: "danger",
          title: "Overdue reminder",
          message: `${overdueBooks.length} book(s) are overdue.`,
        });
      }

      if (dueSoonBooks.length > 0) {
        const firstDue = parseDateOnly(dueSoonBooks[0].due_date);
        nextNotifications.push({
          id: "due-soon",
          type: "warning",
          title: "Due soon",
          message: `${dueSoonBooks[0].book_title} is due on ${firstDue ? firstDue.toLocaleDateString() : "an upcoming date"}.`,
        });
      }

      if (totalFine > 0) {
        nextNotifications.push({
          id: "fines",
          type: "danger",
          title: "Pending fine",
          message: `You have Rs. ${totalFine} in fines.`,
        });
      }

      if (mySuggestions.length > 0) {
        nextNotifications.push({
          id: "suggestions",
          type: "info",
          title: "Suggestions",
          message: `You submitted ${mySuggestions.length} suggestion(s).`,
        });
      }

      if (nextNotifications.length === 0) {
        nextNotifications.push({
          id: "no-alerts",
          type: "info",
          title: "No new alerts",
          message: "No urgent notifications right now.",
        });
      }

      setNotifications(nextNotifications);
      setLastUpdated(new Date());
      setNotificationError("");
    } catch (err) {
      setNotificationError(err?.response?.data?.message || "Unable to load notifications.");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (user?.role === "student") {
      loadNotifications();
    }
  }, [user?.id, user?.role]);

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown((prev) => {
      const next = !prev;
      if (next) {
        setShowDropdown(false);
        loadNotifications();
      }
      return next;
    });
  };

  const unreadCount = notifications.filter((item) => item.type === "danger" || item.type === "warning").length;

  return (
    <header className="bg-white shadow-md px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-200 w-full">
      <div className="flex flex-row md:flex-row justify-between items-center gap-2">
        {/* Hamburger (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden bg-slate-900 text-white p-2 rounded-lg shadow mr-1 order-1"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Title and search bar */}
        <div className="flex-1 min-w-0 order-2 flex flex-col md:flex-row items-start md:items-center gap-0.5 md:gap-2">
          <div className="flex-1">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate">
              <span className="sm:hidden">📚 Smart Library</span>
              <span className="hidden sm:inline">📊 Smart Library Dashboard</span>
            </h1>
            <p className="hidden sm:block text-xs md:text-sm text-slate-500 truncate">
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        {/* User info and dropdown */}
        <div className="flex items-center gap-2 md:gap-4 order-3 relative">
          {user?.role === "student" && (
            <div className="relative">
              <button
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={toggleNotificationDropdown}
                aria-label="Open notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-200 w-80 z-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <span className="text-[11px] text-slate-500">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : "Syncing..."}
                    </span>
                  </div>

                  <div className="mt-2 max-h-80 overflow-y-auto space-y-2 pr-1">
                    {loadingNotifications && (
                      <p className="text-sm text-slate-500">Loading...</p>
                    )}

                    {!loadingNotifications && notificationError && (
                      <p className="text-sm text-red-600">{notificationError}</p>
                    )}

                    {!loadingNotifications && !notificationError && notifications.map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                        <div className="flex items-start gap-2">
                          {item.type === "danger" && <AlertTriangle size={15} className="text-red-600 mt-0.5" />}
                          {item.type === "warning" && <Clock3 size={15} className="text-amber-600 mt-0.5" />}
                          {(item.type === "info" || (!item.type || (item.type !== "danger" && item.type !== "warning"))) && (
                            <Bell size={15} className="text-sky-600 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-600">{item.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2 sm:px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
            onClick={() => {
              setShowNotificationDropdown(false);
              setShowDropdown((v) => !v);
            }}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs md:text-sm font-medium text-slate-700 capitalize">
              {user?.role}
            </span>
            <User size={16} className="text-slate-500" />
          </div>
          {showDropdown && (
            <div className="absolute right-0 top-12 bg-white rounded shadow-lg border border-slate-200 w-40 z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700"
                onClick={() => { setShowDropdown(false); navigate("/profile"); }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 text-red-600"
                onClick={() => { setShowDropdown(false); logout(); }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
