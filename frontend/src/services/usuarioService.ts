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


export const checkEmailExists = async (email: string, token: string): Promise<boolean> => {
  const response = await axios.get(`${apiUrl}/verificar-email?email=${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.exists;
};


export const inactivateUsuario = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${apiUrl}/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
