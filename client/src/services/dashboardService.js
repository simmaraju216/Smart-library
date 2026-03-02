import api from './api';

export const getAdminDashboardStats = async () => {
  const { data } = await api.get('/students/dashboard-stats');
  return data;
};
