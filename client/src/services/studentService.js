import api from './api';

export const getStudents = async () => (await api.get('/students')).data;
export const addStudent = async (payload) => (await api.post('/students', payload)).data;
export const setStudentRole = async (id, role) => (await api.patch(`/students/${id}/role`, { role })).data;
export const deleteStudent = async (id) => (await api.delete(`/students/${id}`)).data;