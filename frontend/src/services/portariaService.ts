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
    const agendamentos = response.data;

    for (const agendamento of agendamentos) {
      if (agendamento.CodigoProduto) {
        try {
          const descricaoProduto = await getProdutoByCodigo(agendamento.CodigoProduto, token);
          agendamento.DescricaoProduto = descricaoProduto;
        } catch (error) {
          console.error(`Erro ao buscar o produto para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }

      if (agendamento.CodigoSafra) {
        try {
          const anoSafra = await getAnoSafraByCodigo(agendamento.CodigoSafra, token);
          agendamento.AnoSafra = anoSafra;
        } catch (error) {
          console.error(`Erro ao buscar a safra para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }

      if (agendamento.CodigoAgendamento) {
        try {
          const dadosPortaria = await getDadosPortaria(token, agendamento.CodigoAgendamento);
          agendamento.ObservacaoPortaria = dadosPortaria?.ObservacaoPortaria || '';
        } catch (error) {
          console.error(`Erro ao buscar a observação da portaria para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }
    }

    return agendamentos;
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



export const getProdutoByCodigo = async (codigoProduto: number, token: string) => {
  try {
    const response = await api.get(`/produtos/${codigoProduto}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.DescricaoProduto;
  } catch (error) {
    console.error("Erro ao buscar Produto:", error);
    throw error;
  }
};

// Função para finalizar um agendamento e definir a DataHoraSaida
export const finalizarAgendamento = async (
  token: string,
  agendamentoId: number,
  tipoAgendamento: string,
  observacao: string
): Promise<void> => {
  try {
    const agendamentoAtual = await api.get(`/agendamentos/${agendamentoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { Observacao, UsuarioAprovacao } = agendamentoAtual.data;
    const dataHoraSaida = new Date().toISOString();

    await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Finalizado",
        TipoAgendamento: tipoAgendamento,
        DataHoraSaida: dataHoraSaida,
        Observacao: Observacao || observacao || "Sem observação",
        UsuarioAprovacao: UsuarioAprovacao,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await api.put(
      `/portarias/${agendamentoId}`,
      {
        DataHoraSaida: dataHoraSaida,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: unknown) {
    console.error("Erro ao finalizar o agendamento:", error);
    throw error;
  }
};

// Função para atualizar a DataHoraSaida na portaria
export const atualizarPortaria = async (token: string, portariaId: number, dataHoraSaida: string) => {
  try {
    const response = await api.put(
      `/portarias/${portariaId}`,
      { DataHoraSaida: dataHoraSaida },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar a portaria:", error);
    throw error;
  }
};

// Função para aprovar agendamento e preencher o campo DataHoraEntrada
export const aprovarAgendamento = async (
  token: string,
  agendamentoId: number,
  tipoAgendamento: string,
  usuarioId: number,
  observacaoPortaria: string
) => {
  try {
    const agendamentoAtual = await api.get(`/agendamentos/${agendamentoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { Observacao, UsuarioAprovacao } = agendamentoAtual.data;

    await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Andamento",
        DataHoraEntrada: new Date().toISOString(),
        TipoAgendamento: tipoAgendamento,
        UsuarioAprovacao: UsuarioAprovacao || usuarioId,
        Observacao: Observacao || "Sem observação",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await api.post(
      `/portarias`,
      {
        CodigoAgendamento: agendamentoId,
        DataHoraEntrada: new Date().toISOString(),
        UsuarioAprovacao: usuarioId,
        ObservacaoPortaria: observacaoPortaria || "Aprovado pela portaria",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { message: "Agendamento aprovado com sucesso" };
  } catch (error: unknown) {
    console.error("Erro ao aprovar agendamento:", error);
    throw error;
  }
};

// Função para recusar agendamento e enviar o MotivoRecusa para a tabela de portaria
export const recusarAgendamento = async (
  token: string,
  agendamentoId: number,
  motivoRecusa: string,
  usuarioId: number,
  tipoAgendamento: string
): Promise<{ message: string }> => {
  try {
    const agendamentoAtual = await api.get(`/agendamentos/${agendamentoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { Observacao, UsuarioAprovacao } = agendamentoAtual.data;

    await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Reprovado",
        MotivoRecusa: motivoRecusa,
        TipoAgendamento: tipoAgendamento,
        Observacao: Observacao || "Sem observação",
        UsuarioAprovacao: UsuarioAprovacao,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await api.post(
      `/portarias`,
      {
        CodigoAgendamento: agendamentoId,
        DataHoraEntrada: new Date().toISOString(),
        UsuarioAprovacao: usuarioId,
        MotivoRecusa: motivoRecusa,
        ObservacaoPortaria: "Reprovado",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { message: "Agendamento recusado com sucesso e motivo salvo na portaria" };
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

// Função para buscar os dados da portaria relacionados a um agendamento
export const getDadosPortaria = async (token: string, codigoAgendamento: number) => {
  try {
    const response = await api.get(`/portarias/${codigoAgendamento}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar dados da portaria:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao buscar dados da portaria:', error);
    }
    throw error;
  }
};

export const getAnoSafraByCodigo = async (codigoSafra: number, token: string) => {
  try {
    const response = await api.get(`/safras/${codigoSafra}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.AnoSafra;
  } catch (error) {
    console.error(`Erro ao buscar AnoSafra para o código ${codigoSafra}:`, error);
    throw error;
  }
};