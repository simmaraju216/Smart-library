import axios from "axios";

/*
  IMPORTANT:
  In Vercel → Settings → Environment Variables
  You MUST set:

  VITE_API_URL = https://smart-library-n8ze.onrender.com/api
*/

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error("❌ VITE_API_URL is not defined!");
}

const api = axios.create({
  baseURL
});

/* ===========================
   Attach JWT Token
=========================== */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===========================
   Handle 401 Unauthorized
=========================== */

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