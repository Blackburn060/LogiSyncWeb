import axios from 'axios';
import { Usuario } from '../models/Usuario';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

export const getUsuario = async (token: string, userId: number): Promise<Usuario> => {
  const response = await axios.get(`${apiUrl}/usuarios/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
