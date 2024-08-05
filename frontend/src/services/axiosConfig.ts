import axios, { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

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

api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const { refreshAccessToken, logout } = useAuth();

      try {
        await refreshAccessToken();
        const originalRequest = error.config;
        const newAccessToken = localStorage.getItem('accessToken');
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (err) {
        logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const isAxiosError = (error: any): error is AxiosError => {
  return error.isAxiosError;
};

export default api;
