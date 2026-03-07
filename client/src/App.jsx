import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { useState } from 'react';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StudentRoute from './components/StudentRoute';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBatch from './pages/admin/ManageBatch';
import ManageBranch from './pages/admin/ManageBranch';
import AddStudent from './pages/admin/AddStudent';
import ManageBooks from './pages/admin/ManageBooks';
import IssueBook from './pages/admin/IssueBook';
import ReturnBook from './pages/admin/ReturnBook';
import LateFee from './pages/admin/LateFee';
import ViewRatings from './pages/admin/ViewRatings';
import ViewSuggestions from './pages/admin/ViewSuggestions';
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableBooks from './pages/student/AvailableBooks';
import MyBooks from './pages/student/MyBooks';
import MyFine from './pages/student/MyFine';
import Ratings from './pages/student/Ratings';
import Suggestions from './pages/student/Suggestions';
import AIChat from './pages/student/AIChat';
import Profile from './pages/common/Profile';
import NotFound from './pages/common/NotFound';
import { useAuth } from './context/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);
  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>
      <div className="flex flex-1 pt-20"> {/* pt-20 for navbar height */}
        {/* Fixed Sidebar (md+) or overlay (mobile) */}
        <div
          className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 z-40 md:block ${sidebarOpen ? 'block' : 'hidden'}`}
        >
          <Sidebar open={sidebarOpen} onClose={closeSidebar} />
        </div>
        {/* Main Content Scrollable */}
        <main className="flex-1 ml-0 md:ml-64 px-3 py-4 md:pl-4 md:pr-4 overflow-auto h-[calc(100vh-5rem)] lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/admin" element={<ProtectedRoute><AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/manage-batch" element={<ProtectedRoute><AdminRoute><Layout><ManageBatch /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/manage-branch" element={<ProtectedRoute><AdminRoute><Layout><ManageBranch /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/manage-students" element={<ProtectedRoute><AdminRoute><Layout><AddStudent /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/add-student" element={<ProtectedRoute><AdminRoute><Layout><AddStudent /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/manage-books" element={<ProtectedRoute><AdminRoute><Layout><ManageBooks /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/issue-book" element={<ProtectedRoute><AdminRoute><Layout><IssueBook /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/return-book" element={<ProtectedRoute><AdminRoute><Layout><ReturnBook /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/late-fee" element={<ProtectedRoute><AdminRoute><Layout><LateFee /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/view-ratings" element={<ProtectedRoute><AdminRoute><Layout><ViewRatings /></Layout></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/view-suggestions" element={<ProtectedRoute><AdminRoute><Layout><ViewSuggestions /></Layout></AdminRoute></ProtectedRoute>} />

      <Route path="/student" element={<ProtectedRoute><StudentRoute><Layout><StudentDashboard /></Layout></StudentRoute></ProtectedRoute>} />
      <Route path="/student/available-books" element={<ProtectedRoute><StudentRoute><Layout><AvailableBooks /></Layout></StudentRoute></ProtectedRoute>} />
      <Route path="/student/my-books" element={<ProtectedRoute><StudentRoute><Layout><MyBooks /></Layout></StudentRoute></ProtectedRoute>} />
      <Route path="/student/my-fine" element={<ProtectedRoute><StudentRoute><Layout><MyFine /></Layout></StudentRoute></ProtectedRoute>} />
      <Route path="/student/ratings" element={<ProtectedRoute><StudentRoute><Layout><Ratings /></Layout></StudentRoute></ProtectedRoute>} />
      <Route path="/student/suggestions" element={<ProtectedRoute><StudentRoute><Layout><Suggestions /></Layout></StudentRoute></ProtectedRoute>} />
      <Route path="/student/ai-chat" element={<ProtectedRoute><StudentRoute><Layout><AIChat /></Layout></StudentRoute></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin' : user?.role === 'student' ? '/student' : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;