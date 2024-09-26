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

    // Iterar pelos agendamentos e buscar a descrição do produto para cada um
    for (const agendamento of agendamentos) {
      if (agendamento.CodigoProduto) {
        try {
          const descricaoProduto = await getProdutoByCodigo(agendamento.CodigoProduto, token);
          agendamento.DescricaoProduto = descricaoProduto;  // Adiciona a descrição do produto ao agendamento
        } catch (error) {
          console.error(`Erro ao buscar o produto para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }

      // **Ajuste importante aqui**: Carregar a observação da portaria
      if (agendamento.CodigoAgendamento) {
        try {
          const dadosPortaria = await getDadosPortaria(token, agendamento.CodigoAgendamento);
          agendamento.ObservacaoPortaria = dadosPortaria?.ObservacaoPortaria || '';  // Adiciona a observação da portaria
        } catch (error) {
          console.error(`Erro ao buscar a observação da portaria para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }
    }

    return agendamentos;  // Retorna os agendamentos com os três status
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
  // Função para finalizar o agendamento e definir a DataHoraSaida
// Função para finalizar o agendamento e definir a DataHoraSaida
export const finalizarAgendamento = async (token: string, agendamentoId: number, tipoAgendamento: string, dataHoraSaida: string) => {
  try {
    const response = await api.put(
      `/agendamentos/${agendamentoId}`,  // rota para atualizar o agendamento
      { SituacaoAgendamento: "Finalizado", DataHoraSaida: dataHoraSaida, TipoAgendamento: tipoAgendamento },  // payload
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Resposta da API ao finalizar agendamento:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao finalizar agendamento:", error);
    throw error;
  }
};

  
// Função para atualizar a DataHoraSaida na portaria
export const atualizarPortaria = async (token: string, portariaId: number, dataHoraSaida: string) => {
  try {
    const response = await api.put(
      `/portarias/${portariaId}`,  // rota para atualizar a portaria
      { DataHoraSaida: dataHoraSaida },  // payload contendo a DataHoraSaida
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Resposta da API ao atualizar a portaria:", response.data);
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
    observacaoPortaria?: string // Adicionar este parâmetro
  ) => {
    try {
      await api.put(
        `/agendamentos/${agendamentoId}`,
        {
          SituacaoAgendamento: "Andamento", 
          DataHoraEntrada: new Date().toISOString(),
          TipoAgendamento: tipoAgendamento,
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
          ObservacaoPortaria: observacaoPortaria || "Aprovado pela portaria",  // Adiciona a observação da portaria
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
  export const recusarAgendamento = async (
    token: string,
    agendamentoId: number,
    motivoRecusa: string,
    usuarioId: number,
    tipoAgendamento: string
  ): Promise<{ message: string }> => {
    try {
      await api.put(
        `/agendamentos/${agendamentoId}`,
        {
          SituacaoAgendamento: "Reprovado",
          MotivoRecusa: motivoRecusa,
          TipoAgendamento: tipoAgendamento // Inclui o tipo de agendamento aqui
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Retorne a mensagem de sucesso
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
      throw error; // Lança o erro para ser tratado externamente
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
        // Tratamento específico para o erro 404 (dados da portaria não encontrados)
        return null; // Retorne nulo para indicar que não há dados da portaria
      }
      // Aqui você pode manter o log de outros erros, exceto 404
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
