import api from './axiosConfig';
import { Safra } from '../models/Safra';

export const getSafras = async (token: string): Promise<Safra[]> => {
  const response = await api.get('/safras', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const addSafra = async (safra: Safra, userId: number, token: string): Promise<void> => {
  const safraWithUser = { ...safra, UsuarioAlteracao: userId };
  await api.post('/safras', safraWithUser, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateSafra = async (id: number, safra: Safra, userId: number, token: string): Promise<void> => {
  const safraWithUser = { ...safra, UsuarioAlteracao: userId };
  await api.put(`/safras/${id}`, safraWithUser, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteSafra = async (id: number, token: string): Promise<void> => {
  await api.delete(`/safras/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
