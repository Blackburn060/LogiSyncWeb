import axios, { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const api = axios.create({
  baseURL: backendUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401) {
      const { refreshAccessToken, logout } = useAuth();

      try {
        await refreshAccessToken();
        const newAccessToken = localStorage.getItem('token');
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (err) {
        logout();
        return Promise.reject(error);
      }
    }
    
    // Adiciona um tratamento especial para erros de requisição de `blob`
    if (error.response && error.response.data instanceof Blob && error.response.data.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = () => {
        const errorMessage = JSON.parse(reader.result as string);
        return Promise.reject(new Error(errorMessage.message));
      };
      reader.readAsText(error.response.data);
    }
    
    return Promise.reject(error);
  }
);


export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError !== undefined;
}

export default api;
