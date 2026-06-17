import axios from 'axios';

// Production backend URL (hardcoded so Vercel env mistakes cannot break login)
const BACKEND_URL = 'https://finance-tracker-pi-wheat.vercel.app';

const resolveBaseURL = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }
  return BACKEND_URL;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
