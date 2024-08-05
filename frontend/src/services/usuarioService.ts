// services/usuarioService.ts
import axios from 'axios';
import { Usuario } from '../models/Usuario';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

export const getUsuario = async (token: string, id: number): Promise<Usuario> => {
  const response = await axios.get(`${apiUrl}/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateUsuario = async (token: string, id: number, usuario: Partial<Usuario>): Promise<void> => {
  await axios.put(`${apiUrl}/usuarios/${id}`, usuario, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
