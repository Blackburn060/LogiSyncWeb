// frontend/src/services/axiosConfig.ts
import axios from 'axios';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const api = axios.create({
  baseURL: backendUrl,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
