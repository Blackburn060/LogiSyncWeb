import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
interface DecodedToken {
  id?: number; // Adicionando a propriedade 'id'
  userId?: number;
  sub?: number; // Use "sub" se "userId" não estiver presente
}



// Função para buscar agendamentos por usuário com a placa associada
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

export const getAgendamentos = async (token: string): Promise<Agendamento[]> => {
  try {
    const response = await api.get('/agendamentos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
};

// Função para adicionar um novo agendamento
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

// Função para buscar agendamentos por data
// Função para atualizar o status do agendamento no banco de dados
export const updateAgendamentoStatus = async (
  id: number, 
  data: Partial<Agendamento>
) => {
  try {
    const accessToken = localStorage.getItem('accessToken'); // Obtendo o token correto
    if (!accessToken) {
      throw new Error('Token não encontrado');
    }

    // Decodificando o token
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(accessToken);
    console.log("Token decodificado:", decodedToken); // Log para verificar os campos no token

    // Usando 'id' em vez de 'userId' ou 'sub'
    const usuarioId = decodedToken.id;

    if (!usuarioId) {
      throw new Error('ID do usuário não encontrado no token');
    }

    // Atualizando o status do agendamento
    const response = await api.put(`/agendamentos/${id}`, {
      ...data,
      UsuarioAprovacao: usuarioId, // Usando o campo 'id' do token para aprovar o usuário
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar o status do agendamento", error);
    throw error;
  }
};
// Função para autorizar agendamentos
export const autorizarAgendamento = async (token: string, id: number): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Token não encontrado');
    }

    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(accessToken);
    const usuarioId = decodedToken.userId || decodedToken.sub;

    if (!usuarioId) {
      throw new Error('ID do usuário não encontrado no token');
    }

    await api.put(`/agendamentos/${id}`, { 
      SituacaoAgendamento: 'Confirmado',
      UsuarioAprovacao: usuarioId // Registrando o usuário que confirmou o agendamento
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Agendamento autorizado com sucesso');
  } catch (error) {
    console.error('Erro ao autorizar agendamento:', error);
    throw error;
  }
};

// Função para recusar agendamentos com motivo
export const recusarAgendamento = async (token: string, id: number, motivo: string): Promise<void> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Token não encontrado');
    }

    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(accessToken);
    const usuarioId = decodedToken.userId || decodedToken.sub;

    if (!usuarioId) {
      throw new Error('ID do usuário não encontrado no token');
    }

    await api.put(`/agendamentos/${id}`, { 
      SituacaoAgendamento: 'Recusado',
      UsuarioAprovacao: usuarioId, // Registrando o usuário que recusou o agendamento
      MotivoRecusa: motivo
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Agendamento recusado com sucesso');
  } catch (error) {
    console.error('Erro ao recusar agendamento:', error);
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
