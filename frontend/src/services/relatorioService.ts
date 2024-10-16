import api from './axiosConfig';
import { isAxiosError } from './axiosConfig';

interface FiltrosRelatorio {
    dataInicio: string;
    dataFim: string;
    codigoTransportadora?: string;
    codigoProduto?: string;
    codigoSafra?: string;
    situacao?: string;
    tipoAgendamento?: string;
}

// Função auxiliar para ler o conteúdo de um Blob como texto
const readBlobAsText = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(blob);
    });
};

// Verifica se o objeto contém uma propriedade 'message'
const isErrorMessage = (obj: any): obj is { message: string } => {
    return typeof obj === 'object' && obj !== null && 'message' in obj && typeof obj.message === 'string';
};

export const gerarRelatorio = async (reportName: string, filtros: FiltrosRelatorio): Promise<Blob | null> => {
    try {
        const response = await api.post(
            `/reports/${reportName}`,
            filtros,
            { responseType: 'blob', validateStatus: (status) => status === 200 || status === 204 }
        );

        if (response.status === 204) {
            return null;
        }

        return response.data; 
    } catch (error) {
        if (isAxiosError(error)) {
            if (error.response?.data instanceof Blob) {
                try {
                    const errorText = await readBlobAsText(error.response.data);
                    const errorMessage = JSON.parse(errorText);

                    if (isErrorMessage(errorMessage)) {
                        throw new Error(errorMessage.message || 'Erro desconhecido ao gerar o relatório');
                    } else {
                        throw new Error('Erro desconhecido ao gerar o relatório');
                    }
                } catch {
                    throw new Error('Erro ao processar a resposta do relatório');
                }
            }
            throw new Error(isErrorMessage(error.response?.data) ? error.response.data.message : 'Erro ao gerar o relatório');
        } else {
            throw new Error('Erro desconhecido ao gerar o relatório');
        }
    }
};