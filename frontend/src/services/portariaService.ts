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

    // Iterar pelos agendamentos e buscar os dados adicionais
    for (const agendamento of agendamentos) {
      if (agendamento.CodigoProduto) {
        try {
          const descricaoProduto = await getProdutoByCodigo(agendamento.CodigoProduto, token);
          agendamento.DescricaoProduto = descricaoProduto;  // Adiciona a descrição do produto ao agendamento
        } catch (error) {
          console.error(`Erro ao buscar o produto para o agendamento ${agendamento.CodigoAgendamento}`, error);
        }
      }

      // Buscar AnoSafra associado ao CodigoSafra
      if (agendamento.CodigoSafra) {
        try {
          const anoSafra = await getAnoSafraByCodigo(agendamento.CodigoSafra, token);
          agendamento.AnoSafra = anoSafra;  // Adiciona o AnoSafra ao agendamento
        } catch (error) {
          console.error(`Erro ao buscar a safra para o agendamento ${agendamento.CodigoAgendamento}`, error);
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
      // Obter os dados atuais do agendamento para preservar os valores existentes
      const agendamentoAtual = await api.get(`/agendamentos/${agendamentoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const { Observacao, UsuarioAprovacao } = agendamentoAtual.data; // Pegue o valor atual da observação e do usuário
  
      // Define a DataHoraSaida como o horário atual
      const dataHoraSaida = new Date().toISOString();
  
      // Atualizar o status do agendamento para "Finalizado", preservando a observação e outros dados existentes
      await api.put(
        `/agendamentos/${agendamentoId}`,
        {
          SituacaoAgendamento: "Finalizado",
          TipoAgendamento: tipoAgendamento,
          DataHoraSaida: dataHoraSaida, // Inclui a data/hora de saída na atualização
          Observacao: Observacao || observacao || "Sem observação", // Inclui a observação atualizada ou existente
          UsuarioAprovacao: UsuarioAprovacao, // Preserva o valor do UsuarioAprovacao
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
          DataHoraSaida: dataHoraSaida, // Envia a data/hora de saída para a portaria
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
    // Obter os dados atuais do agendamento para preservar os valores existentes
    const agendamentoAtual = await api.get(`/agendamentos/${agendamentoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { Observacao, UsuarioAprovacao } = agendamentoAtual.data; // Pegue o valor atual da observação e do usuário

    // Atualizar o agendamento para "Andamento", preservando `UsuarioAprovacao` e `Observacao`
    await api.put(
      `/agendamentos/${agendamentoId}`,
      {
        SituacaoAgendamento: "Andamento", 
        DataHoraEntrada: new Date().toISOString(),
        TipoAgendamento: tipoAgendamento,
        UsuarioAprovacao: UsuarioAprovacao || usuarioId, // Preserve ou use o novo valor
        Observacao: Observacao || "Sem observação", // Preserve o valor da observação existente
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


  // Função para recusar agendamento e enviar o MotivoRecusa para a tabela de portaria
  export const recusarAgendamento = async (
    token: string,
    agendamentoId: number,
    motivoRecusa: string,
    usuarioId: number,
    tipoAgendamento: string
  ): Promise<{ message: string }> => {
    try {
      // Obter os dados atuais do agendamento para preservar os valores existentes
      const agendamentoAtual = await api.get(`/agendamentos/${agendamentoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const { Observacao, UsuarioAprovacao } = agendamentoAtual.data; // Pegue o valor atual da observação e do usuário
      
      // Atualizar apenas os campos necessários no agendamento, preservando `UsuarioAprovacao` e `Observacao`
      await api.put(
        `/agendamentos/${agendamentoId}`,
        {
          SituacaoAgendamento: "Reprovado",
          MotivoRecusa: motivoRecusa, // Enviar motivo da recusa apenas para `agendamentos`
          TipoAgendamento: tipoAgendamento,
          Observacao: Observacao || "Sem observação", // Preservar o valor da observação existente
          UsuarioAprovacao: UsuarioAprovacao, // Não modificar o valor do `UsuarioAprovacao`, apenas preservá-lo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Agora, insira os dados na tabela de `portaria`, alterando o `UsuarioAprovacao` e `MotivoRecusa` lá
      await api.post(
        `/portarias`,
        {
          CodigoAgendamento: agendamentoId, // ID do agendamento vinculado
          DataHoraEntrada: new Date().toISOString(), // Hora atual
          UsuarioAprovacao: usuarioId, // Apenas aqui alteramos o usuário que fez a recusa
          MotivoRecusa: motivoRecusa, // Motivo da recusa
          ObservacaoPortaria: "Recusado", // Deixe a observação simples e não duplicada com `MotivoRecusa`
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
export const getAnoSafraByCodigo = async (codigoSafra: number, token: string) => {
  try {
    const response = await api.get(`/safras/${codigoSafra}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.AnoSafra; // Retorna o AnoSafra
  } catch (error) {
    console.error(`Erro ao buscar AnoSafra para o código ${codigoSafra}:`, error);
    throw error;
  }
};

