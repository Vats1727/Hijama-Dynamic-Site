import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/server';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept successful mutating requests to trigger preview reloads
api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      window.dispatchEvent(new CustomEvent('api-data-updated', { detail: { method, url: response.config.url } }));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http')) return path;
  
  const fullPath = path.startsWith('upload/') ? path : `upload/${path}`;
  const baseUrl = import.meta.env.VITE_API_URL || '/server';
  return `${baseUrl}/${fullPath}`;
};

export default api;
