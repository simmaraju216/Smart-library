import api from './api';

export const smsServiceInfo = () => ({
  message: 'SMS reminders are triggered by backend scheduler daily.'
});

export const sendStudentNotification = async (payload) => {
  const { data } = await api.post('/students/notify', payload);
  return data;
};