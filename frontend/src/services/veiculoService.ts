// services/veiculoService.ts
import axios from 'axios';
import { Veiculo } from '../models/Veiculo';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

export const getVeiculos = async (token: string): Promise<Veiculo[]> => {
  const response = await axios.get(`${apiUrl}/veiculos`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const addVeiculo = async (token: string, veiculo: Omit<Veiculo, 'CodigoVeiculo'>): Promise<{ id: number }> => {
  const response = await axios.post(`${apiUrl}/veiculos`, veiculo, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateVeiculo = async (token: string, id: number, veiculo: Partial<Veiculo>): Promise<void> => {
  await axios.put(`${apiUrl}/veiculos/${id}`, veiculo, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteVeiculo = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${apiUrl}/veiculos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
