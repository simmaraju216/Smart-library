import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { user, resetPassword } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await resetPassword(user.id, password);
    setMessage('Password updated. Please login again.');
    setTimeout(() => navigate('/login'), 1000);
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form className="bg-white p-6 rounded shadow w-96 space-y-3" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <input className="w-full border p-2 rounded" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button className="w-full bg-slate-900 text-white py-2 rounded">Update</button>
      </form>
    </div>
  );
};

export default ResetPassword;