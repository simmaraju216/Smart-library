import axios from 'axios';

const api = axios.create({
  // PRODUCTION: Set VITE_API_URL in client/.env to your deployed backend URL and avoid relying on localhost fallback.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;