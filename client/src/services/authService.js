import api from './api';

export const loginApi = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const resetPasswordApi = async (payload) => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data;
};

export const getMyProfileApi = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const updateMyProfileApi = async (payload) => {
  const { data } = await api.patch('/auth/me', payload);
  return data;
};