import axios from 'axios';
import { Transportadora } from '../models/Transportadora';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

// Função para buscar uma transportadora pelo ID
export const getTransportadora = async (token: string, id: number): Promise<Transportadora | null> => {
  try {
    const response = await axios.get(`${apiUrl}/transportadoras/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.message) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar transportadora:', error);
    return null;
  }
};

// Função para atualizar uma transportadora existente
export const updateTransportadora = async (token: string, id: number, transportadora: Partial<Transportadora>): Promise<void> => {
  try {
    await axios.put(`${apiUrl}/transportadoras/${id}`, transportadora, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar transportadora:', error);
    throw error;
  }
};

// Função para deletar uma transportadora
export const deleteTransportadora = async (token: string, id: number): Promise<void> => {
  try {
    await axios.delete(`${apiUrl}/transportadoras/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Erro ao deletar transportadora:', error);
    throw error;
  }
};

// Função para adicionar uma nova transportadora
export const addTransportadora = async (token: string, transportadora: Partial<Transportadora>): Promise<{ transportadora: Transportadora; token: string }> => {
  try {
    const response = await axios.post(`${apiUrl}/transportadoras`, transportadora, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.data || !response.data.transportadora || !response.data.transportadora.CodigoTransportadora) {
      throw new Error('CodigoTransportadora não retornado do backend');
    }

    // Retorna a transportadora e o token atualizados
    return {
      transportadora: response.data.transportadora,
      token: response.data.token,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao adicionar transportadora:', error.message);
    } else {
      console.error('Erro desconhecido ao adicionar transportadora:', error);
    }
    throw error;
  }
};
// Função para atualizar o usuário com o CodigoTransportadora
export const updateUserTransportadora = async (token: string, userId: number, transportadoraId: number): Promise<void> => {
  try {
    if (!transportadoraId) {
      throw new Error('Erro: CodigoTransportadora é undefined ou nulo');
    }


    const response = await axios.put(`${apiUrl}/usuarios/${userId}`, { CodigoTransportadora: transportadoraId }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Usuário atualizado com sucesso:', response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao atualizar usuário com transportadora:', error.message);
      throw new Error(`Erro ao atualizar usuário com transportadora: ${error.message}`);
    } else {
      console.error('Erro inesperado ao atualizar usuário com transportadora:', error);
      throw new Error('Erro inesperado ao atualizar usuário com transportadora.');
    }
  }
};
