import { useAuth } from "../context/AuthContext";
import { Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = ({ toggleSidebar, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Only show search bar for students
  const isStudent = user?.role === "student";

  return (
    <header className="bg-white shadow-md px-4 py-3 border-b border-slate-200 w-full">
      <div className="flex flex-row md:flex-row justify-between items-center gap-2">
        {/* Hamburger (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="md:hidden bg-slate-900 text-white p-2 rounded-lg shadow mr-2 order-1"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Title and search bar */}
        <div className="flex-1 min-w-0 order-2 flex flex-col md:flex-row items-center gap-2">
          <div className="flex-1">
            <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">
              📊 Smart Library Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-500 truncate">
              Welcome back, {user?.name}
            </p>
          </div>
          {/* Search bar removed for students */}
        </div>

        {/* User info and dropdown */}
        <div className="flex items-center gap-2 md:gap-4 order-3 relative">
          <div
            className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full shadow-sm cursor-pointer"
            onClick={() => setShowDropdown(v => !v)}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs md:text-sm font-medium text-slate-700 capitalize">
              {user?.role}
            </span>
            <User size={18} className="ml-1 text-slate-500" />
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
