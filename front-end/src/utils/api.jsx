import axios from 'axios';

// Pull the URL from your environment variables
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3306/api';

export const ASSET_BASE_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;