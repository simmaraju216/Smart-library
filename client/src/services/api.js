// api.js
// Axios instance for making API requests to the backend.
// Uses VITE_API_URL environment variable for the base URL.
// If VITE_API_URL is not set, defaults to http://localhost:5000/api (for local development).
// Make sure to set VITE_API_URL in your .env file for production deployments.
import axios from "axios";

// TODO (Production): Set VITE_API_URL in environment and remove localhost fallback.
const baseURL = import.meta.env.VITE_API_URL?.trim() || "https://smart-library-n8ze.onrender.com";

if (!import.meta.env.VITE_API_URL) {
  console.warn("⚠️ VITE_API_URL is not defined. Falling back to http://localhost:5000/api");
}

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
