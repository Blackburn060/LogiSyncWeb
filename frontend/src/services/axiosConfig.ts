import axios, { AxiosError } from 'axios';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const api = axios.create({
  baseURL: backendUrl,
});

// Função para realizar o logout e limpar localStorage
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login'; // Redireciona o usuário para a página de login
};

// Função para renovar o token de acesso
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      // Envia o refreshToken no corpo da requisição
      const response = await axios.post(`${backendUrl}/refresh-token`, { refreshToken });
      const newToken = response.data.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        return newToken;
      }
    } catch (error) {
      console.error('Erro ao renovar o token:', error);
      logout(); // Faz logout se a renovação falhar
    }
  }
  return null;
};

// Interceptor de requisição para adicionar o token no cabeçalho
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

// Interceptor de resposta para lidar com erros 401 e tentar renovar o token
api.interceptors.response.use(
  (response) => response, // Se a resposta for bem-sucedida, apenas a retorna
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de renovação do token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca a requisição para evitar loops infinitos

      // Tenta renovar o token
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // Reenvia a requisição original com o novo token
      }
    }

    // Se falhar ou não for possível renovar o token, faz logout
    if (error.response && error.response.status === 401) {
      logout(); // Faz logout se a renovação falhar ou não houver refresh token
    }

    return Promise.reject(error); // Rejeita o erro se for diferente de 401
  }
);

export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError !== undefined;
};

export default api;
