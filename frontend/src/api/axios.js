import axios from 'axios';

const BACKEND_URL = 'https://finance-tracker-pi-wheat.vercel.app';
const FRONTEND_HOST = 'finance-tracker-epub.vercel.app';

const resolveBaseURL = () => {
  // Local development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // Ignore misconfigured env that points to the frontend itself
  if (envUrl && !envUrl.includes(FRONTEND_HOST)) {
    return envUrl.replace(/\/$/, '');
  }

  // Production on Vercel: same-origin requests proxied by frontend/vercel.json
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return '';
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
