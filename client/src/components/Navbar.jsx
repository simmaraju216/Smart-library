import { useAuth } from "../context/AuthContext";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = ({ toggleSidebar, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

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
          <div
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 px-2 sm:px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
            onClick={() => setShowDropdown(v => !v)}
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
