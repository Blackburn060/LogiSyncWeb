import api from './axiosConfig';
import { Safra } from '../models/Safra';

export const getSafras = async (): Promise<Safra[]> => {
  const response = await api.get('/safras');
  return response.data;
};

export const addSafra = async (safra: Safra, userId: number): Promise<void> => {
  const safraWithUser = { ...safra, UsuarioAlteracao: userId };
  await api.post('/safras', safraWithUser);
};

export const updateSafra = async (id: number, safra: Safra, userId: number): Promise<void> => {
  const safraWithUser = { ...safra, UsuarioAlteracao: userId };
  await api.put(`/safras/${id}`, safraWithUser);
};

export const deleteSafra = async (id: number): Promise<void> => {
  await api.delete(`/safras/${id}`);
};
