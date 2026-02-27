import api from './api';

export const getBooks = async () => (await api.get('/books')).data;
export const createBook = async (payload) => (await api.post('/books', payload)).data;

export const updateBook = async (id, payload) => (await api.patch(`/books/${id}`, payload)).data;
export const deleteBook = async (id) => (await api.delete(`/books/${id}`)).data;