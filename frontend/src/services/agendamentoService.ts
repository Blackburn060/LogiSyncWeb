// services/agendamentoService.ts
import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';

// Buscar agendamentos por usuário com a placa associada
export const getAgendamentosComPlaca = async (accessToken: string, userId: number): Promise<Agendamento[]> => {
  const response = await api.get(`/agendamentos-com-placa?CodigoUsuario=${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

// Adicionar um novo agendamento
export const addAgendamento = async (accessToken: string, agendamento: Agendamento): Promise<Agendamento> => {
  const response = await api.post('/agendamentos', agendamento, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

// Atualizar um agendamento existente
export const updateAgendamento = async (accessToken: string, agendamento: Agendamento): Promise<void> => {
  await api.put(`/agendamentos/${agendamento.CodigoAgendamento}`, agendamento, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// Deletar um agendamento
export const deleteAgendamento = async (accessToken: string, agendamentoId: number): Promise<void> => {
  await api.delete(`/agendamentos/${agendamentoId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
