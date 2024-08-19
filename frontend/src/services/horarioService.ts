import axios from 'axios';
import { Horario } from '../models/Horario';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

export const getHorariosDisponiveis = async (data: string): Promise<Horario[]> => {
  try {
    const response = await axios.get(`${apiUrl}/horarios-disponiveis`, {
      params: { data },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar horários disponíveis');
  }
};

export const confirmarHorario = async (horario: Partial<Horario>): Promise<void> => {
  try {
    await axios.post(`${apiUrl}/agendamentos`, horario);
  } catch (error) {
    throw new Error('Erro ao confirmar agendamento');
  }
};
