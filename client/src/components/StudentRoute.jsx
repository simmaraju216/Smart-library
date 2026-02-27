import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'student' ? children : <Navigate to="/admin" replace />;
};

export default StudentRoute;