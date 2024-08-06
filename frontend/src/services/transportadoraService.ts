import axios from 'axios';
import { Transportadora } from '../models/Transportadora';

const apiUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

export const getTransportadora = async (token: string, id: number): Promise<Transportadora> => {
  const response = await axios.get(`${apiUrl}/transportadoras/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateTransportadora = async (token: string, id: number, transportadora: Partial<Transportadora>): Promise<void> => {
  await axios.put(`${apiUrl}/transportadoras/${id}`, transportadora, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteTransportadora = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${apiUrl}/transportadoras/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const addTransportadora = async (token: string, transportadora: Partial<Transportadora>): Promise<Transportadora> => {
  const response = await axios.post(`${apiUrl}/transportadoras`, transportadora, {
    headers: {
      Authorization: `Bearer {token}`
    }
  });
  return response.data;
};

export const updateUserTransportadora = async (token: string, userId: number, transportadoraId: number): Promise<void> => {
  await axios.put(`${apiUrl}/usuarios/${userId}/transportadoras`, { transportadoraId }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
