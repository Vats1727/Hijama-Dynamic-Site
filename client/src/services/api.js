import axios from 'axios';

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = isLocal ? '/server' : (import.meta.env.VITE_API_URL || '/server');

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

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http')) return path;
  
  const fullPath = path.startsWith('upload/') ? path : `upload/${path}`;
  const baseUrl = isLocal ? '/server' : (import.meta.env.VITE_API_URL || '/server');
  return `${baseUrl}/${fullPath}`;
};

export default api;
