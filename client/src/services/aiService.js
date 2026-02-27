import api from './api';

export const askAI = async (query) => (await api.post('/ai/ask', { query })).data;