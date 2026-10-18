import axios from 'axios';

// Pull the URL from your environment variables
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const ASSET_BASE_URL = API_URL.replace(/\/api\/?$/, '');

// Returns a usable image address. Cloudinary images are already full
// https:// links and are used as-is; older records that only have a
// /uploads/... path get the back-end address added in front.
export const assetUrl = (u) =>
  !u ? null : /^https?:\/\//i.test(u) ? u : `${ASSET_BASE_URL}${u}`;

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