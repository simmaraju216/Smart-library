import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  return <div className="bg-white p-4 rounded shadow">{user?.name} | {user?.email} | {user?.role}</div>;
};

export default Profile;