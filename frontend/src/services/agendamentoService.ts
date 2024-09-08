import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';
import { AxiosError } from 'axios';

// Buscar agendamentos por usuário com a placa associada
export const getAgendamentosComPlaca = async (token: string, userId: number): Promise<Agendamento[]> => {
  try {
    console.log('Buscando agendamentos com placa para usuário:', userId);
    const response = await api.get(`/agendamentos-com-placa?CodigoUsuario=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao buscar agendamentos com placa:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao buscar agendamentos com placa:', error);
    }
    throw error;
  }
};

// Adicionar um novo agendamento
export const addAgendamento = async (token: string, agendamento: Agendamento): Promise<Agendamento> => {
  try {
    console.log('Enviando novo agendamento para API:', agendamento);
    const response = await api.post('/agendamentos', agendamento, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Resposta da API - Agendamento adicionado:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao adicionar agendamento:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao adicionar agendamento:', error);
    }
    throw error;
  }
};

// Atualizar um agendamento existente
export const updateAgendamento = async (token: string, agendamento: Agendamento): Promise<void> => {
  try {
    console.log('Atualizando agendamento:', agendamento);
    await api.put(`/agendamentos/${agendamento.CodigoAgendamento}`, agendamento, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Agendamento atualizado com sucesso');
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao atualizar agendamento:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao atualizar agendamento:', error);
    }
    throw error;
  }
};

// Registrar indisponibilidade
export const registrarIndisponibilidade = async (
  token: string,
  agendamento: { CodigoUsuario: number; DataAgendamento: string; HoraAgendamento: string; DiaTodo: number; TipoAgendamento: string }
): Promise<void> => {
  try {
    console.log('Registrando indisponibilidade:', agendamento);
    await api.post('/agendamentos/indisponibilidade', agendamento, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Indisponibilidade registrada com sucesso');
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao registrar indisponibilidade:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao registrar indisponibilidade:', error);
    }
    throw new Error('Erro ao registrar indisponibilidade');
  }
};

// Buscar todas as indisponibilidades (independente do usuário)
export const getIndisponibilidades = async (token: string): Promise<Agendamento[]> => {
  try {
    console.log('Buscando indisponibilidades');
    const response = await api.get('/agendamentos/indisponibilidades', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Resposta da API - Indisponibilidades:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao buscar indisponibilidades:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao buscar indisponibilidades:', error);
    }
    throw error;
  }
};

// Excluir uma indisponibilidade
export const deleteIndisponibilidade = async (token: string, id: number): Promise<void> => {
  try {
    console.log('Excluindo indisponibilidade com ID:', id);
    await api.delete(`/agendamentos/indisponibilidade/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Indisponibilidade excluída com sucesso');
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao excluir indisponibilidade:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao excluir indisponibilidade:', error);
    }
    throw error;
  }
};