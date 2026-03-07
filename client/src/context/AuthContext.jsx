import { createContext, useContext, useMemo, useState } from 'react';
import { getMyProfileApi, loginApi, resetPasswordApi, updateMyProfileApi } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const resetPassword = async (userId, newPassword) => resetPasswordApi({ userId, newPassword });

  const refreshProfile = async () => {
    try {
      const data = await getMyProfileApi();
      const latestUser = data?.user || null;
      if (latestUser) {
        setUser(latestUser);
        localStorage.setItem('user', JSON.stringify(latestUser));
      }
      return latestUser;
    } catch (error) {
      // Older deployed APIs may not have /auth/me yet; keep existing local user to avoid breaking profile UI.
      if (error?.response?.status === 404) {
        return user;
      }
      throw error;
    }
  };

  const updateProfile = async (payload) => {
    const data = await updateMyProfileApi(payload);
    const updatedUser = data?.user || null;
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = useMemo(
    () => ({ token, user, login, logout, resetPassword, refreshProfile, updateProfile }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);