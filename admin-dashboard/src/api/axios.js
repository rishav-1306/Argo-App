import axios from 'axios';

const API_BASE_URL = 'https://argo-app-api.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('argo_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('argo_admin_token');
      localStorage.removeItem('argo_admin_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
