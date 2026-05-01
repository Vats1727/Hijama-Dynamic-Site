import axios from 'axios';

const API_BASE_URL = '/server';

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
  return `/server/${fullPath}`;
};

export default api;
