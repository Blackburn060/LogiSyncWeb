import axios from 'axios';
import { HorarioDisponibilidade } from '../models/HorarioDisponibilidade';
 
const API_URL = 'http://localhost:3001/api/horarios';

export const getHorarios = async (): Promise<HorarioDisponibilidade[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    throw error;
  }
};

export const updateHorario = async (id: number, day: string, status: 'disponível' | 'indisponível' | 'pendente'): Promise<void> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, { day, status });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    throw error;
  }
};
