import axios from 'axios';
import { Usuario } from '../models/Usuario';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

// Função para obter dados de um usuário específico
export const getUsuario = async (token: string, id: number): Promise<Usuario> => {
  const response = await axios.get(`${apiUrl}/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Função para atualizar um usuário
export const updateUsuario = async (token: string, id: number, usuario: Partial<Usuario>): Promise<void> => {
  await axios.put(`${apiUrl}/usuarios/${id}`, usuario, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Função para verificar se o e-mail já existe no sistema
export const checkEmailExists = async (email: string, token: string): Promise<boolean> => {
  const response = await axios.get(`${apiUrl}/verificar-email?email=${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.exists;
};

// Função para verificar se o e-mail já existe no sistema e se a conta está ativa (endpoint público)
export const checkEmailExistsPublic = async (email: string): Promise<{ exists: boolean, active: boolean }> => {
  const response = await axios.get(`${apiUrl}/verificar-email/public?email=${email}`);
  return response.data;
};

// Função para inativar um usuário
export const inactivateUsuario = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${apiUrl}/usuarios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Função para criar um novo usuário (endpoint público)
export const createUsuarioPublic = async (usuario: Omit<Usuario, 'id'>): Promise<number> => {
  try {
    const response = await axios.post(`${apiUrl}/usuarios/public`, usuario);
    return response.data.id;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};