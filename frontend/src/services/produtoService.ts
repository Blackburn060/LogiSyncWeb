import axios from 'axios';
import { Produto } from '../models/Produto';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

// Função para buscar todos os produtos
export const getProdutos = async (token: string): Promise<Produto[]> => {
  try {
    const response = await axios.get<Produto[]>(`${apiUrl}/produtos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar produtos');
  }
};

// Função para adicionar um novo produto
export const addProduto = async (token: string, produto: Produto): Promise<void> => {
  try {
    await axios.post(`${apiUrl}/produtos`, produto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error('Erro ao adicionar produto');
  }
};

// Função para atualizar um produto existente
export const updateProduto = async (token: string, produto: Partial<Produto>, id: number): Promise<void> => {
  try {
    await axios.put(`${apiUrl}/produtos/${id}`, produto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error('Erro ao atualizar produto');
  }
};

// Função para deletar um produto (soft delete)
export const deleteProduto = async (token: string, id: number): Promise<void> => {
  try {
    await axios.delete(`${apiUrl}/produtos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    throw new Error('Erro ao deletar produto');
  }
};
