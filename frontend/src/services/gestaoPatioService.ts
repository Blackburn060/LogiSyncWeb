import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const getAgendamentosGestaoPatio = async (
  token: string,
  dataAgendamento: string,
  status: string | null = null
) => {
  try {
    const response = await axios.get(`${apiUrl}/agendamentos-gestao-patio`, {
      params: { data: dataAgendamento, status },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar agendamentos para a gestão de pátio:", error);
    throw error;
  }
};
