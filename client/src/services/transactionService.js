import api from './api';

export const getTransactions = async () => (await api.get('/transactions')).data;
export const issueBook = async (payload) => (await api.post('/transactions/issue', payload)).data;
export const returnBook = async (payload) => (await api.post('/transactions/return', payload)).data;
export const getMyBooks = async () => (await api.get('/transactions/my')).data;
export const getMyFines = async () => (await api.get('/fines/my')).data;
export const getAllFines = async () => (await api.get('/fines')).data;