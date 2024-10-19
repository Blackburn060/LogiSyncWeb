import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id?: number;
}

// Função para buscar agendamentos por usuário com a placa associada
export const getAgendamentosComPlacaIncremental = async (
  token: string,
  userId: string,
  limit: number = 50,  // Define o limite por página
  offset: number = 0   // Começa com o offset inicial em 0
): Promise<Agendamento[]> => {
  const allAgendamentos: Agendamento[] = [];
  let hasMoreData = true;

  try {
    // Loop para buscar agendamentos enquanto houver dados disponíveis
    while (hasMoreData) {
      const response = await api.get(
        `/agendamentos-com-placa?CodigoUsuario=${userId}&limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Se não houver dados ou o status for 204 (sem conteúdo), pare a busca
      if (response.status === 204 || !response.data.length) {
        hasMoreData = false;
      } else {
        // Adiciona os agendamentos retornados à lista total
        allAgendamentos.push(...response.data);

        // Incrementa o offset para buscar o próximo lote
        offset += limit;
      }
    }

    return allAgendamentos; // Retorna todos os agendamentos após finalizar as requisições
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Erro ao buscar agendamentos com placa:", error.message);
      if (error.response) {
        console.error("Detalhes do erro:", error.response.data);
      }
    } else {
      console.error("Erro desconhecido ao buscar agendamentos com placa:", error);
    }
    throw error;
  }
};



// Função para buscar agendamentos
export const getAgendamentos = async (token: string): Promise<Agendamento[]> => {
  try {
    const response = await api.get('/agendamentos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return [];
    }

    let agendamentos = response.data;

    // Filtra agendamentos que não são "Indisponível"
    agendamentos = agendamentos.filter(
      (agendamento: Agendamento) => agendamento.SituacaoAgendamento !== "Indisponível"
    );

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
          const anoSafra = await getSafraByCodigo(agendamento.CodigoSafra, token);
          agendamento.AnoSafra = anoSafra;
        } catch (error) {
          console.error(`Erro ao buscar o AnoSafra para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }

      if (agendamento.ArquivoAnexado) { // Adicione lógica para preencher Arquivo se estiver presente
        agendamento.Arquivo = agendamento.ArquivoAnexado;
      }
    }

    return agendamentos;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
};


// Função para buscar dados da portaria por CodigoAgendamento
export const getDadosPortaria = async (codigoAgendamento: number, token: string) => {
  try {
    const response = await api.get(`/portarias/${codigoAgendamento}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados da portaria:", error);
    throw error;
  }
};

// Função para buscar o nome do Produto
export const getProdutoByCodigo = async (codigoProduto: number, token: string) => {
  try {
    const response = await api.get(`/cadastroprodutos/${codigoProduto}`, {
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
// Função para buscar a safra pelo código
export const getSafraByCodigo = async (codigoSafra: number, token: string) => {
  try {
    const response = await api.get(`/cadastrosafra/${codigoSafra}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.AnoSafra;
  } catch (error) {
    console.error("Erro ao buscar Safra:", error);
    throw error;
  }
};
export const addAgendamento = async (token: string, agendamento: Agendamento): Promise<Agendamento> => {
  try {
    const response = await api.post('/agendamentos', agendamento, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
export const getAgendamentosAdmin = async (token: string): Promise<Agendamento[]> => {
  try {
    const response = await api.get('/agendamentosAdmin', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro ao buscar agendamentos admin:', error.message);
      if (error.response) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } else {
      console.error('Erro desconhecido ao buscar agendamentos admin:', error);
    }
    throw error;
  }
};
// Função para atualizar o status do agendamento no banco de dados
export const updateAgendamentoStatus = async (
  id: number, 
  data: Partial<Agendamento>,
  token: string
) => {
  try {
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
    const usuarioId = decodedToken.id;

    if (!usuarioId) {
      throw new Error('ID do usuário não encontrado no token');
    }

    const response = await api.put(`/agendamentos/${id}`, {
      ...data,
      UsuarioAprovacao: usuarioId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar o status do agendamento", error);
    throw error;
  }
};

// Função para autorizar agendamentos


// Função para recusar agendamentos com motivo
export const recusarAgendamento = async (token: string, id: number, motivo: string): Promise<void> => {
  try {
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
    const usuarioId = decodedToken.id;

    if (!usuarioId) {
      throw new Error('ID do usuário não encontrado no token');
    }

    await api.put(`/agendamentos/${id}`, { 
      SituacaoAgendamento: 'Recusado',
      UsuarioAprovacao: usuarioId,
      MotivoRecusa: motivo
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Erro ao recusar agendamento:', error);
    throw error;
  }
};

// Atualizar um agendamento existente
export const updateAgendamento = async (token: string, agendamento: Agendamento): Promise<void> => {
  try {
    await api.put(`/agendamentos/${agendamento.CodigoAgendamento}`, agendamento, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    await api.post('/agendamentos/indisponibilidade', agendamento, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
    const response = await api.get('/agendamentos/indisponibilidades', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return [];
    }

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
    await api.delete(`/agendamentos/indisponibilidade/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
