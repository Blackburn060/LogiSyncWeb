import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { gerarRelatorio } from '../services/relatorioService';
import Navbar from '../components/Navbar';
import { FaSpinner } from 'react-icons/fa';

const RelatorioPage: React.FC = () => {
    const [reportName, setReportName] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [codigoTransportadora, setCodigoTransportadora] = useState('');
    const [codigoProduto, setCodigoProduto] = useState('');
    const [codigoSafra, setCodigoSafra] = useState('');
    const [situacao, setSituacao] = useState('');
    const [tipoAgendamento, setTipoAgendamento] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        if (!reportName || !dataInicio || !dataFim) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setIsGenerating(true);

        try {
            const pdfBlob = await gerarRelatorio(reportName, {
                dataInicio,
                dataFim,
                codigoTransportadora,
                codigoProduto,
                codigoSafra,
                situacao,
                tipoAgendamento
            });

            if (!pdfBlob) {
                toast.error('Nenhum dado encontrado para os parâmetros informados.');
                return;
            }

            const fileURL = URL.createObjectURL(pdfBlob);
            window.open(fileURL);
        } catch (error: any) {
            toast.error(error.message || 'Erro ao gerar o relatório');
            console.error('Erro ao gerar relatório:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <Toaster position="top-right" containerClassName='mt-20'/>
            <div className="flex-grow flex flex-col items-center p-6">
                <div className="w-full max-w-lg bg-logisync-color-blue-400 p-6 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold mb-4 text-center text-white shadow-md bg-logisync-color-blue-50 p-2 rounded">
                        Relatórios
                    </h1>
                    
                    <div className="mb-4">
                        <label className="block text-white text-lg font-extrabold mb-2" htmlFor="reportName">
                            Selecione o Relatório
                        </label>
                        <select
                            id="reportName"
                            value={reportName}
                            onChange={(e) => setReportName(e.target.value)}
                            className="mt-2 p-2 border rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="">Selecione...</option>
                            <option value="agendamentos">Relatório de Agendamentos</option>
                            <option value="portaria">Relatório de Veículos por Portaria</option>
                            <option value="transportadoras">Relatório de Transportadoras</option>
                        </select>
                    </div>

                    {/* Filtros */}
                    <div className="mb-4">
                        <label className="block text-white text-lg font-extrabold mb-2" htmlFor="dataInicio">
                            Data de Início
                        </label>
                        <input
                            type="date"
                            id="dataInicio"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="mt-2 p-2 border rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-lg font-extrabold mb-2" htmlFor="dataFim">
                            Data de Fim
                        </label>
                        <input
                            type="date"
                            id="dataFim"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="mt-2 p-2 border rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    {reportName === 'agendamentos' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-white text-lg font-extrabold mb-2">Situação</label>
                                <select
                                    value={situacao}
                                    onChange={(e) => setSituacao(e.target.value)}
                                    className="mt-2 p-2 border rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="">Todas</option>
                                    <option value="Aprovado">Aprovado</option>
                                    <option value="Pendente">Pendente</option>
                                    <option value="Recusado">Recusado</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-white text-lg font-extrabold mb-2">Tipo de Agendamento</label>
                                <select
                                    value={tipoAgendamento}
                                    onChange={(e) => setTipoAgendamento(e.target.value)}
                                    className="mt-2 p-2 border rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="">Todos</option>
                                    <option value="Carga">Carga</option>
                                    <option value="Descarga">Descarga</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={handleGenerateReport}
                            className="bg-logisync-color-blue-50 hover:bg-logisync-color-blue-200 text-white font-extrabold py-2 w-full rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
                            disabled={isGenerating}
                        >
                            {isGenerating ? <FaSpinner className="animate-spin text-2xl" /> : 'Gerar Relatório'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RelatorioPage;