import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

// Interface para decodificar o token
interface DecodedToken {
  id?: number; // O campo 'id' será utilizado para identificar o usuário
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

// Função para buscar agendamentos
// Função para buscar agendamentos
export const getAgendamentos = async (token: string): Promise<Agendamento[]> => {
  try {
    const response = await api.get('/agendamentos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const agendamentos = response.data;

    console.log('Agendamentos recebidos:', agendamentos);

    // Iterar pelos agendamentos e buscar a descrição do produto e o AnoSafra para cada um
    for (const agendamento of agendamentos) {
      if (agendamento.CodigoProduto) {
        try {
          const descricaoProduto = await getProdutoByCodigo(agendamento.CodigoProduto, token);
          console.log(`Produto encontrado: ${descricaoProduto} para agendamento ${agendamento.CodigoAgendamento}`);
          agendamento.DescricaoProduto = descricaoProduto; // Adiciona a descrição do produto ao agendamento
        } catch (error) {
          console.error(`Erro ao buscar o produto para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      } else {
        console.log(`Agendamento ${agendamento.CodigoAgendamento} não possui CodigoProduto.`);
      }

      // Adicionar a busca pelo AnoSafra se o CodigoSafra estiver presente
      if (agendamento.CodigoSafra) {
        try {
          const anoSafra = await getSafraByCodigo(agendamento.CodigoSafra, token);
          console.log(`Ano da safra encontrado: ${anoSafra} para agendamento ${agendamento.CodigoAgendamento}`);
          agendamento.AnoSafra = anoSafra; // Adiciona o AnoSafra ao agendamento
        } catch (error) {
          console.error(`Erro ao buscar o AnoSafra para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }
    }

    return agendamentos;
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

// Função para buscar o nome do Produto
export const getProdutoByCodigo = async (codigoProduto: number, token: string) => {
  try {
    const response = await api.get(`/produtos/${codigoProduto}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.DescricaoProduto;  // Retorna a descrição do produto
  } catch (error) {
    console.error("Erro ao buscar Produto:", error);
    throw error;
  }
};

// Função para buscar a safra pelo código
export const getSafraByCodigo = async (codigoSafra: number, token: string) => {
  try {
    const response = await api.get(`/safras/${codigoSafra}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.AnoSafra;  // Retorna o ano da safra
  } catch (error) {
    console.error("Erro ao buscar Safra:", error);
    throw error;
  }
};

// Função para atualizar o status do agendamento no banco de dados
// Função para atualizar o status do agendamento no banco de dados
export const updateAgendamentoStatus = async (
  id: number, 
  data: Partial<Agendamento>,
  token: string
) => {
  try {
    // Decodificando o token para obter o ID do usuário
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
    const usuarioId = decodedToken.id;

    if (!usuarioId) {
      throw new Error('ID do usuário não encontrado no token');
    }

    // Verifique se o TipoAgendamento está sendo enviado corretamente
    console.log("TipoAgendamento enviado:", data.TipoAgendamento);

    // Atualizando o status do agendamento com o tipo de agendamento
    const response = await api.put(`/agendamentos/${id}`, {
      ...data,
      UsuarioAprovacao: usuarioId, // Registrando o usuário que aprovou ou rejeitou o agendamento
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
export const finalizarAgendamento = async (
  token: string,
  agendamentoId: number,
  tipoAgendamento: string
) => {
  try {
    const dataHoraSaida = new Date().toISOString(); // Gera a data/hora atual
    console.log('DataHoraSaida enviada:', dataHoraSaida); // Verifica no console se está sendo enviada

    const response = await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Finalizado",
        DataHoraSaida: dataHoraSaida,
        TipoAgendamento: tipoAgendamento,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Resposta da API ao finalizar:', response.data); // Verifica o que o backend está retornando
    return { message: "Agendamento finalizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao finalizar o agendamento:", error);
    throw error;
  }
};

// Função para recusar agendamentos com motivo
export const recusarAgendamento = async (token: string, id: number, motivo: string): Promise<void> => {
  try {
    // Decodificando o token para obter o ID do usuário
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
    const usuarioId = decodedToken.id;

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
