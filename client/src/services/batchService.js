import api from './api';

export const getBatches = async () => (await api.get('/students/batches')).data;
