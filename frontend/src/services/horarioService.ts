import axios from 'axios';
import { Horario } from '../models/Horario';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

// Função para buscar todos os horários cadastrados
export const getHorarios = async (): Promise<Horario[]> => {
  try {
    const response = await axios.get(`${apiUrl}/horarios`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar horários');
  }
};

// Função para atualizar um horário específico
export const updateHorario = async (id: number, horario: Partial<Horario>): Promise<void> => {
  try {
    await axios.put(`${apiUrl}/horarios/${id}`, horario);
  } catch (error) {
    throw new Error('Erro ao atualizar horário');
  }
};

// Função para buscar horários disponíveis com base na data e no tipo de agendamento
export const getHorariosDisponiveis = async (data: string, tipoAgendamento: string): Promise<Horario[]> => {
  try {
    const response = await axios.get(`${apiUrl}/horarios-disponiveis`, {
      params: { data, tipoAgendamento }, // Adicionando tipoAgendamento aqui
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
