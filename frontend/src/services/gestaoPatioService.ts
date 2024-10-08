import axios from 'axios'; // Certifique-se de que essa linha está presente

// Definindo a URL da API
const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

// Interface para Agendamento
interface Agendamento {
  CodigoAgendamento: number;
  CodigoVeiculo: number;
  HoraAgendamento: string;
  Placa?: string;
  SituacaoAgendamento: string;
  DataAgendamento: string;
  TipoAgendamento: string;
}

// Interface para Veículo
interface Veiculo {
  CodigoVeiculo: number;
  Placa: string;
  Marca: string;
  ModeloTipo: string;
  AnoFabricacao: number;
  Cor: string;
}

// Função para buscar agendamentos no backend
export const getAgendamentosGestaoPatio = async (
  token: string,
  dataAgendamento: string,
  status: string | null = null
): Promise<Agendamento[]> => {
  try {
    const response = await axios.get(`${apiUrl}/agendamentos-gestao-patio`, {
      params: { data: dataAgendamento, status },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) => status < 500 // Tratar status 204 como sucesso
    });

    // Se o status for 204, retorna um array vazio
    if (response.status === 204) {
      return [];
    }

    console.log("Response data:", response.data);
    return response.data as Agendamento[];
  } catch (error) {
    console.error("Erro ao buscar agendamentos para a gestão de pátio:", error);
    throw error;
  }
};
// Função para buscar veículo por código
export const getVeiculoPorCodigo = async (token: string, codigoVeiculo: number): Promise<Veiculo | null> => {
  if (!token) {
    throw new Error("Token de autenticação não fornecido.");
  }

  try {
    const response = await axios.get<Veiculo>(`${apiUrl}/veiculos/${codigoVeiculo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Erro ao buscar veículo:", error.message);
      throw new Error(`Erro ao buscar veículo: ${error.response?.data?.message || error.message}`);
    } else {
      throw new Error("Erro desconhecido ao buscar veículo.");
    }
  }
};

// Função para escutar atualizações dos agendamentos via SSE (Server-Sent Events)
export const escutarAtualizacoesAgendamentos = (
  token: string,
  onUpdate: (data: Agendamento) => void
): EventSource => {
  if (!token) {
    throw new Error("Token de autenticação não fornecido.");
  }

  const eventSource = new EventSource(`${apiUrl}/sse/agendamentos?token=${encodeURIComponent(token)}`);

  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const data: Agendamento = JSON.parse(event.data);
      console.log("Atualização recebida via SSE:", data);
      onUpdate(data);
    } catch (error) {
      console.error("Erro ao processar os dados do SSE:", error);
    }
  };

  eventSource.onerror = (error: Event) => {
    console.error("Erro na conexão SSE:", error);
  };

  return eventSource;
};
