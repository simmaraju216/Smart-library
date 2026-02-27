import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Layers,
  GitBranch,
  Users,
  BookOpen,
  BookPlus,
  BookCheck,
  DollarSign,
  Star,
  MessageSquare,
  User,
} from "lucide-react";

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "Manage Batch", path: "/admin/manage-batch", icon: <Layers size={18} /> },
    { label: "Manage Branch", path: "/admin/manage-branch", icon: <GitBranch size={18} /> },
    { label: "Manage Students", path: "/admin/manage-students", icon: <Users size={18} /> },
    { label: "Manage Books", path: "/admin/manage-books", icon: <BookOpen size={18} /> },
    { label: "Issue Book", path: "/admin/issue-book", icon: <BookPlus size={18} /> },
    { label: "Return Book", path: "/admin/return-book", icon: <BookCheck size={18} /> },
    { label: "Late Fee", path: "/admin/late-fee", icon: <DollarSign size={18} /> },
    { label: "View Ratings", path: "/admin/view-ratings", icon: <Star size={18} /> },
    { label: "View Suggestions", path: "/admin/view-suggestions", icon: <MessageSquare size={18} /> },
  ];

  const studentLinks = [
    { label: "Dashboard", path: "/student", icon: <LayoutDashboard size={18} /> },
    { label: "Available Books", path: "/student/available-books", icon: <BookOpen size={18} /> },
    { label: "My Books", path: "/student/my-books", icon: <BookCheck size={18} /> },
    { label: "My Fine", path: "/student/my-fine", icon: <DollarSign size={18} /> },
    { label: "Ratings", path: "/student/ratings", icon: <Star size={18} /> },
    { label: "Suggestions", path: "/student/suggestions", icon: <MessageSquare size={18} /> },
    { label: "AI Chat", path: "/student/ai-chat", icon: <MessageSquare size={18} /> },
  ];

  const links = user?.role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 h-full w-64
          bg-gradient-to-b from-slate-900 to-slate-800
          text-white p-6 z-40 shadow-xl
          transform transition-transform duration-300
          overflow-y-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white p-2 rounded-lg">
            <BookOpen size={20} className="text-slate-900" />
          </div>
          <h2 className="text-xl font-bold tracking-wide">
            Smart Library
          </h2>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {links.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-white text-slate-900 font-semibold shadow"
                      : "hover:bg-white/10"
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Profile */}
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 mt-4 border-t border-white/20 pt-4 rounded-lg hover:bg-white/10"
          >
            <User size={18} />
            Profile
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
