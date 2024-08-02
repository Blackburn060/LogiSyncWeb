import axios from 'axios';
import { HorarioDisponibilidade } from '../models/HorarioDisponibilidade';

const API_URL = 'http://localhost:3001/api/horarios';

export const getHorarios = async (): Promise<HorarioDisponibilidade[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const updateHorario = async (id: number, day: string, status: 'disponível' | 'indisponível' | 'pendente'): Promise<void> => {
  try {
    console.log(`Enviando dados para atualização: id=${id}, day=${day}, status=${status}`);
    const response = await axios.put(`${API_URL}/${id}`, {
      day,
      status
    });
    console.log('Resposta do servidor:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar horário:', error.response ? error.response.data : error.message);
    throw error;
  }
};