import axios from 'axios';
import { HorarioDisponibilidade } from '../models/HorarioDisponibilidade';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

export const getHorarios = async (): Promise<HorarioDisponibilidade[]> => {
  const response = await axios.get(`${backendUrl}/horarios`);
  return response.data;
};

export const updateHorario = async (id: number, day: string, status: 'disponível' | 'indisponível' | 'pendente'): Promise<void> => {
  try {
    await axios.put(`${backendUrl}/horarios/${id}`, {
      day,
      status
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao atualizar horário:', error.response ? error.response.data : error.message);
    } else {
      console.error('Erro inesperado ao atualizar horário:', error);
    }
    throw error;
  }
};
