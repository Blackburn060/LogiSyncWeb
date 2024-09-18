import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';
import { AxiosError } from 'axios';

// Função para buscar agendamentos com status "Aprovado", "Andamento" ou "Finalizado"
export const getAgendamentosPorStatus = async (token: string): Promise<Agendamento[]> => {
  try {
    const response = await api.get('/agendamentos/status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Retorna os agendamentos com os três status
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao buscar agendamentos:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao buscar agendamentos:', error);
    }
    throw error;
  }
};

// Função para finalizar um agendamento
export const finalizarAgendamento = async (token: string, agendamentoId: number): Promise<void> => {
  try {
    const response = await api.put(
      `/agendamentos/${agendamentoId}`, 
      { SituacaoAgendamento: 'Finalizado' }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Agendamento finalizado com sucesso:', response.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao finalizar agendamento:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao finalizar agendamento:', error);
    }
    throw error;
  }
};

// Função para aprovar agendamento e preencher o campo DataHoraEntrada
// Função para aprovar agendamento e preencher o campo DataHoraEntrada
export const aprovarAgendamento = async (
  token: string,
  agendamentoId: number,
  tipoAgendamento: string,
  usuarioId: number // ID do usuário que aprovou
) => {
  try {
    // Atualizar o status do agendamento
    await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Andamento", // Status para andamento
        DataHoraEntrada: new Date().toISOString(), // Atualiza a DataHoraEntrada
        TipoAgendamento: tipoAgendamento, // Mantém o tipo original do agendamento
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Atualizar os dados na tabela de portaria (inserir ou atualizar)
    await api.post(
      `/portarias`, // Certifique-se de que essa rota exista no seu backend para criar os dados de portaria
      {
        CodigoAgendamento: agendamentoId,
        DataHoraEntrada: new Date().toISOString(), // Atualiza a data/hora de entrada
        UsuarioAprovacao: usuarioId, // Usuário que aprovou
        ObservacaoPortaria: "Aprovado pela portaria" // Pode ser atualizado conforme a necessidade
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { message: "Agendamento aprovado com sucesso" };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Erro ao aprovar agendamento:", error.message);
      if (error.response) {
        console.error("Detalhes do erro:", error.response.data);
      }
    } else {
      console.error("Erro desconhecido ao aprovar agendamento:", error);
    }
    throw error;
  }
};


// Função para recusar agendamento e alterar o status para "Recusado"
// Função para recusar agendamento e alterar o status para "Recusado"
export const recusarAgendamento = async (
  token: string,
  agendamentoId: number,
  motivoRecusa: string, // Motivo da recusa
  usuarioId: number // ID do usuário que recusou
) => {
  try {
    // Atualizar o status do agendamento para "Recusado"
    await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Recusado", // Atualiza o status para recusado
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Atualizar os dados na tabela de portaria (inserir ou atualizar)
    await api.post(
      `/portarias`,
      {
        CodigoAgendamento: agendamentoId,
        UsuarioAprovacao: usuarioId, // Usuário que recusou
        MotivoRecusa: motivoRecusa, // Motivo da recusa
        ObservacaoPortaria: "Agendamento recusado pela portaria" // Pode ser atualizado conforme a necessidade
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { message: "Agendamento recusado com sucesso" };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Erro ao recusar agendamento:", error.message);
      if (error.response) {
        console.error("Detalhes do erro:", error.response.data);
      }
    } else {
      console.error("Erro desconhecido ao recusar agendamento:", error);
    }
    throw error;
  }
};


// Função para verificar se os dados do motorista estão corretos
export const verificarDadosMotorista = async (token: string, agendamentoId: number): Promise<Agendamento> => {
  try {
    const response = await api.get(`/agendamentos/${agendamentoId}/verificar-dados`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;  // Retorna os dados verificados do agendamento
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao verificar dados do motorista:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao verificar dados do motorista:', error);
    }
    throw error;
  }
};
