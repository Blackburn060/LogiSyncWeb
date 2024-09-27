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
  export const finalizarAgendamento = async (
    token: string, 
    agendamentoId: number, 
    tipoAgendamento: string,
    observacao: string // Adicione a observação como argumento
  ): Promise<void> => {
    try {
      // Define a DataHoraSaida como o horário atual
      const dataHoraSaida = new Date().toISOString();
  
      // Atualizar o status do agendamento para "Finalizado", preservando a observação existente
      await api.put(
        `/agendamentos/${agendamentoId}`,
        {
          SituacaoAgendamento: "Finalizado",
          TipoAgendamento: tipoAgendamento,
          DataHoraSaida: dataHoraSaida, // Inclui a data/hora de saída na atualização
          Observacao: observacao // Inclui a observação atualizada ou existente
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Agora atualiza/inserir a DataHoraSaida na tabela de portaria
      await api.put(
        `/portarias/${agendamentoId}`, // Associa o agendamento à portaria
        {
          DataHoraSaida: dataHoraSaida // Envia a data/hora de saída para a portaria
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Agendamento finalizado e DataHoraSaida atualizada com sucesso.");
    } catch (error: unknown) {
      console.error("Erro ao finalizar o agendamento:", error);
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
    observacaoPortaria: string // Observação da portaria passada
  ) => {
    try {
      // Atualizar o agendamento para "Andamento"
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
  
      // Salvar a observação da portaria na tabela de portaria
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
  
  
  // Função para recusar agendamento e alterar o status para "Recusado"
  // Função para recusar agendamento e enviar o MotivoRecusa para a tabela de portaria
  export const recusarAgendamento = async (
    token: string,
    agendamentoId: number,
    motivoRecusa: string,
    usuarioId: number,
    tipoAgendamento: string
  ): Promise<{ message: string }> => {
    try {
      // Atualiza o agendamento, ajustando o motivo de recusa
      await api.put(
        `/agendamentos/${agendamentoId}`, // Certifique-se de que essa rota esteja correta
        {
          SituacaoAgendamento: "Reprovado",
          MotivoRecusa: motivoRecusa,
          TipoAgendamento: tipoAgendamento, // Certifique-se de que o tipo de agendamento esteja correto
          UsuarioAprovacao: usuarioId, // Quem está recusando o agendamento
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Agora, insira os dados da portaria, caso seja necessário
      await api.post(
        `/portarias`, // Usando POST para criar um novo registro na portaria
        {
          CodigoAgendamento: agendamentoId, // ID do agendamento vinculado
          DataHoraEntrada: new Date().toISOString(), // Hora atual
          UsuarioAprovacao: usuarioId, // Usuário que realizou a recusa
          MotivoRecusa: motivoRecusa, // Motivo da recusa
          ObservacaoPortaria: `Recusado: ${motivoRecusa}`, // Observação explicando a recusa
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
      throw error; // Lançar erro para tratamento posterior
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

