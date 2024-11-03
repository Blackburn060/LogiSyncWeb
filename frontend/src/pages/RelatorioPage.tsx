import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { FaSpinner } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { gerarRelatorio } from '../services/relatorioService';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
            const filtros = {
                dataInicio,
                dataFim,
                codigoTransportadora,
                codigoProduto,
                codigoSafra,
                situacao,
                tipoAgendamento
            };

            const reportData = await gerarRelatorio(reportName, filtros);

            if (!reportData || reportData.rows.length === 0) {
                toast.error('Nenhum dado encontrado para os parâmetros informados.');
                return;
            }

            generatePDF(reportData);
        } catch (error: any) {
            toast.error(error.message || 'Erro ao gerar o relatório');
            console.error('Erro ao gerar relatório:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDateForDisplay = (dateString: string) => {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : dateString;
    };

    const formatDateTimeForDisplay = (dateTimeString: string) => {
        const date = parseISO(dateTimeString);
        return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }) : dateTimeString;
    };

    const generatePDF = (data: { headers: string[]; rows: any[] }) => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(18);
        doc.text(`Relatório de ${reportName}`, 14, 22);

        // Adicionar informações do cabeçalho
        doc.setFontSize(12);
        doc.text(`Gerado por: Nome do Usuário`, 14, 32);
        doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, 14, 40);
        doc.text(`Período: ${formatDateForDisplay(dataInicio)} - ${formatDateForDisplay(dataFim)}`, 14, 48);

        // Configuração da tabela usando headers e rows do JSON
        const headers = data.headers;

        const rows = data.rows.map(row => {
            // Mapeia os dados de acordo com o tipo de relatório
            if (reportName === 'agendamentos') {
                return [
                    row.CodigoAgendamento,
                    row.Usuario,
                    row.Veiculo,
                    row.Produto,
                    row.Transportadora,
                    formatDateForDisplay(row.DataAgendamento),
                    row.HoraAgendamento,
                    row.SituacaoAgendamento,
                    row.Quantidade || '',
                    row.Observacao || ''
                ];
            } else if (reportName === 'portaria') {
                return [
                    row.CodigoPortaria,
                    row.NomeVeiculo,
                    row.Placa,
                    row.Transportadora,
                    formatDateTimeForDisplay(row.DataHoraEntrada),
                    formatDateTimeForDisplay(row.DataHoraSaida),
                    row.ObservacaoPortaria || ''
                ];
            } else if (reportName === 'transportadoras') {
                return [
                    row.Nome,
                    row.QuantidadeAgendamentos
                ];
            } else {
                return headers.map(header => row[header] ?? '');
            }
        });

        autoTable(doc, {
            startY: 60,
            head: [headers],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            styles: { cellPadding: 2, fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 40 },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
                4: { cellWidth: 50 },
                5: { cellWidth: 25 },
                6: { cellWidth: 20 },
                7: { cellWidth: 25 }
            }
        });

        doc.save(`relatorio_${reportName}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <Toaster position="top-right" containerClassName='mt-20' />
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