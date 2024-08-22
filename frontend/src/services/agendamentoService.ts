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
export const registrarIndisponibilidade = async (
  accessToken: string,
  agendamento: { CodigoUsuario: number; DataAgendamento: string; HoraAgendamento: string; DiaTodo: number }
): Promise<void> => {
  try {
    await api.post('/agendamentos/indisponibilidade', agendamento, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    throw new Error('Erro ao registrar indisponibilidade');
  }
};

// Buscar todas as indisponibilidades (independente do usuário)
export const getIndisponibilidades = async (accessToken: string): Promise<Agendamento[]> => {
  const response = await api.get('/agendamentos/indisponibilidades', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

// Excluir uma indisponibilidade
export const deleteIndisponibilidade = async (accessToken: string, id: number): Promise<void> => {
  await api.delete(`/agendamentos/indisponibilidade/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
