import axios from 'axios';
import { Horario } from '../models/Horario';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

// Função para buscar todos os horários cadastrados
export const getHorarios = async (token: string): Promise<Horario[]> => {
  try {
    const response = await axios.get(`${apiUrl}/horarios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar horários');
  }
};

// Função para atualizar um horário específico
export const updateHorario = async (id: number, horario: Partial<Horario>, token: string): Promise<void> => {
  try {
    await axios.put(`${apiUrl}/horarios/${id}`, horario, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error('Erro ao atualizar horário');
  }
};

// Função para buscar horários disponíveis com base na data e no tipo de agendamento
export const getHorariosDisponiveis = async (data: string, TipoAgendamento: string, token: string): Promise<Horario[]> => {
  try {
    const response = await axios.get(`${apiUrl}/horarios-disponiveis`, {
      params: { data, TipoAgendamento },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar horários disponíveis');
  }
};

// Função para confirmar um agendamento de horário
export const confirmarHorario = async (horario: Partial<Horario>, token: string): Promise<void> => {
  try {
    await axios.post(`${apiUrl}/agendamentos`, horario, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error('Erro ao confirmar agendamento');
  }
};

// Função para gerar horários disponíveis entre horarioInicio e horarioFim com base no intervalo especificado
export const gerarHorariosDisponiveis = (horarioInicio: string, horarioFim: string, intervalo: number): string[] => {
  const horariosGerados: string[] = [];
  let current = new Date(`1970-01-01T${horarioInicio}:00`);
  const end = new Date(`1970-01-01T${horarioFim}:00`);

  while (current < end) {
    const next = new Date(current.getTime() + intervalo * 60000);
    if (next > end) break;
    const horaFormatada = `${current.toTimeString().substring(0, 5)} - ${next.toTimeString().substring(0, 5)}`;
    horariosGerados.push(horaFormatada);
    current = next;
  }

  return horariosGerados;
};

// Função para verificar se um horário específico está agendado em uma data específica
export const isHorarioAgendado = async (horarioIntervalo: string, data: string, TipoAgendamento: string, token: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${apiUrl}/agendamentos/agendado`, {
      params: { horarioIntervalo, data, TipoAgendamento },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.agendado;
  } catch (error) {
    throw new Error('Erro ao verificar se o horário está agendado');
  }
};
