// services/agendamentoService.ts
import api from './axiosConfig';
import { Agendamento } from '../models/Agendamento';

export const getAgendamentosComPlaca = async (accessToken: string, userId: number): Promise<Agendamento[]> => {
  const response = await api.get(`/agendamentos-com-placa?CodigoUsuario=${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
