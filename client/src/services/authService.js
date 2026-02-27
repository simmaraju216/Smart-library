import api from './api';

export const loginApi = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const resetPasswordApi = async (payload) => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data;
};