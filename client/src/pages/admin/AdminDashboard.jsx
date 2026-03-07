import { useAuth } from "../../context/AuthContext";
import { Users, BookOpen, BookCheck, MessageSquare, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminDashboardStats } from "../../services/dashboardService";
import { motion } from "framer-motion";
import { getStudents } from "../../services/studentService";
import { sendStudentNotification } from "../../services/smsService";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    books: 0,
    issued: 0,
    suggestions: 0,
  });

  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyPayload, setNotifyPayload] = useState({
    student_id: "",
    send_all: false,
    message: "",
  });
  const [notifyStatus, setNotifyStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashboardStats, studentList] = await Promise.all([
          getAdminDashboardStats(),
          getStudents(),
        ]);

        setStats({
          students: Number(dashboardStats.students || 0),
          books: Number(dashboardStats.books || 0),
          issued: Number(dashboardStats.issued || 0),
          suggestions: Number(dashboardStats.suggestions || 0),
        });
        setStudents(Array.isArray(studentList) ? studentList : []);

        setError("");
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load dashboard stats.");
      }
    };

    fetchStats();
  }, []);

  const onSendNotification = async () => {
    const selectedStudentId = String(notifyPayload.student_id || "").trim();
    const sendAll = Boolean(notifyPayload.send_all);
    const message = String(notifyPayload.message || "").trim();

    if (!sendAll && !selectedStudentId) {
      setNotifyStatus({ type: "error", text: "Please select a student." });
      return;
    }

    if (message.length < 5) {
      setNotifyStatus({ type: "error", text: "Message must be at least 5 characters." });
      return;
    }

    try {
      setSending(true);
      const response = await sendStudentNotification({
        student_id: sendAll ? undefined : selectedStudentId,
        send_all: sendAll,
        message,
      });

      setNotifyStatus({
        type: "success",
        text: response?.message || "Notification sent successfully.",
      });
      setNotifyPayload((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setNotifyStatus({
        type: "error",
        text: err?.response?.data?.message || "Unable to send notification.",
      });
    } finally {
      setSending(false);
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto py-6 px-4 md:px-8 space-y-10"
    >
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">
          Welcome back, {user?.name || "Admin"} 👋
        </h2>

        <p className="text-slate-500 mt-2">
          Here’s what’s happening in your Smart Library today.
        </p>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        {statCards.map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ scale: 1.06 }}
            className={`relative bg-gradient-to-r ${s.color} text-white rounded-xl shadow-xl p-6 overflow-hidden`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm opacity-90 mt-1">{s.label}</div>
              </div>

              <div className="opacity-80">{s.icon}</div>
            </div>

            {/* glow effect */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          </motion.div>
        ))}

      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-semibold mb-5 text-slate-800">
          ⚡ Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <button
            className="bg-slate-900 text-white py-3 rounded-lg hover:scale-105 hover:bg-slate-800 transition shadow-lg"
            onClick={() => navigate('/admin/manage-students')}
          >
            ➕ Add New Student
          </button>

          <button
            className="bg-blue-600 text-white py-3 rounded-lg hover:scale-105 hover:bg-blue-700 transition shadow-lg"
            onClick={() => navigate('/admin/manage-books')}
          >
            📚 Add New Book
          </button>

          <button
            className="bg-green-600 text-white py-3 rounded-lg hover:scale-105 hover:bg-green-700 transition shadow-lg"
            onClick={() => navigate('/admin/issue-book')}
          >
            🔄 Issue Book
          </button>

          <button
            className="bg-red-500 text-white py-3 rounded-lg hover:scale-105 hover:bg-red-600 transition shadow-lg"
            onClick={() => navigate('/admin/late-fee')}
          >
            💰 View Late Fees
          </button>

          <button
            className="bg-violet-600 text-white py-3 rounded-lg hover:scale-105 hover:bg-violet-700 transition shadow-lg flex items-center justify-center gap-2"
            onClick={() => {
              setShowNotifyForm((prev) => !prev);
              setNotifyStatus({ type: "", text: "" });
            }}
          >
            <Bell size={18} /> Send Notification
          </button>

        </div>

        {showNotifyForm && (
          <div className="mt-5 border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <p className="text-sm font-medium text-slate-700">Send message to one student or all students</p>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={notifyPayload.send_all}
                onChange={(e) =>
                  setNotifyPayload((prev) => ({
                    ...prev,
                    send_all: e.target.checked,
                    student_id: e.target.checked ? "" : prev.student_id,
                  }))
                }
              />
              Send to all students at once
            </label>

            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-100 disabled:text-slate-400"
              value={notifyPayload.student_id}
              onChange={(e) =>
                setNotifyPayload((prev) => ({ ...prev, student_id: e.target.value }))
              }
              disabled={notifyPayload.send_all}
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.student_id || student.email || `ID: ${student.id}`})
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Type notification message..."
              value={notifyPayload.message}
              onChange={(e) =>
                setNotifyPayload((prev) => ({ ...prev, message: e.target.value }))
              }
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">{notifyPayload.message.length}/500</span>

              <button
                className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-60"
                onClick={onSendNotification}
                disabled={sending}
              >
                {sending ? "Sending..." : notifyPayload.send_all ? "Send To All" : "Send Now"}
              </button>
            </div>

            {notifyStatus.text && (
              <p
                className={`text-sm ${
                  notifyStatus.type === "success" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {notifyStatus.text}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-3 text-slate-800">
          📌 Admin Responsibilities
        </h3>

        <ul className="space-y-2 text-slate-600">
          <li>✔ Manage students, books, batches, and branches</li>
          <li>✔ Issue and return books manually</li>
          <li>✔ Review late fees, ratings, and suggestions</li>
          <li>✔ Monitor overall library system activity</li>
        </ul>
      </motion.div>

    </motion.div>
  );
};

export default AdminDashboard;