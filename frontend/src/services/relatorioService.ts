import api from './axiosConfig';
import { AxiosError } from 'axios';

interface FiltrosRelatorio {
    dataInicio: string;
    dataFim: string;
    codigoTransportadora?: string;
    codigoProduto?: string;
    codigoSafra?: string;
    situacao?: string;
    tipoAgendamento?: string;
}

interface ReportData {
    headers: string[];
    rows: any[];
}

export const gerarRelatorio = async (reportName: string, filtros: FiltrosRelatorio): Promise<ReportData | null> => {
    try {
        const response = await api.post(`/reports/${reportName}`, filtros);

        if (response.status === 204) {
            return null;
        }

        const parsedData: ReportData = response.data;

        if (!parsedData.headers || !Array.isArray(parsedData.rows)) {
            throw new Error('Resposta do servidor em formato inesperado');
        }

        return parsedData;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Erro ao gerar o relatório');
        } else {
            throw new Error('Erro desconhecido ao gerar o relatório');
        }
    }
};