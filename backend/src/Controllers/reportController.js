const PDFDocument = require('pdfkit');
const reportModel = require('../models/reportModel');
const moment = require('moment');

// Função auxiliar para gerar PDF e enviá-lo como resposta
const gerarPDF = (doc, res) => {
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.contentType('application/pdf');
        res.send(pdfData);
    });
    doc.end();
};

// Função auxiliar para criar uma tabela
const gerarTabelaPDF = (doc, headers, rows) => {
    const tableTop = 180; // Posição inicial da tabela
    const rowHeight = 30; // Altura de cada linha
    const rowSpacing = 10; // Espaço adicional entre o título e as linhas de dados
    const headerHeight = rowHeight + rowSpacing; // Altura total do cabeçalho com espaçamento

    headers.forEach((header, i) => {
        const x = 20 + i * 100;
        const y = tableTop;
        const width = 100;
        const height = rowHeight;

        doc
            .rect(x, y, width, height)
            .stroke();

        doc
            .fontSize(12)
            .text(header, x + 5, y + 5, { width: width - 10, align: 'left' });
    });

    rows.forEach((row, rowIndex) => {
        Object.values(row).forEach((value, i) => {
            const x = 20 + i * 100;
            const y = tableTop + headerHeight + (rowIndex * rowHeight);
            const width = 100;
            const height = rowHeight;

            doc
                .rect(x, y, width, height)
                .stroke();

            doc
                .fontSize(10)
                .text(String(value), x + 5, y + 5, { width: width - 10, align: 'left' });
        });
    });
};

// Função para gerar o cabeçalho do relatório
const gerarCabecalhoPDF = (doc, reportName, userName, dataInicio, dataFim) => {
    const dataGeracao = moment().format('DD/MM/YYYY HH:mm:ss');
    const dataInicioFormatada = moment(dataInicio).format('DD/MM/YYYY');
    const dataFimFormatada = moment(dataFim).format('DD/MM/YYYY');

    doc.fontSize(18).text(`Relatório de ${reportName}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Gerado por: ${userName}`, { align: 'left' });
    doc.text(`Data de geração: ${dataGeracao}`, { align: 'left' });
    doc.text(`Período: ${dataInicioFormatada} - ${dataFimFormatada}`, { align: 'left' });
    doc.moveDown();
};

const gerarRelatorio = async (req, res) => {
    const { reportName } = req.params;
    const { dataInicio, dataFim, codigoTransportadora, codigoProduto, codigoSafra, situacao, tipoAgendamento } = req.body;
    const userName = req.user.nomecompleto;

    try {
        let rows = [];
        let headers = [];

        if (reportName === 'agendamentos') {
            rows = await reportModel.getAgendamentos(dataInicio, dataFim, codigoTransportadora, codigoProduto, codigoSafra, situacao, tipoAgendamento);
            headers = ['Agendamento', 'Usuário', 'Veículo', 'Produto', 'Transportadora', 'Data', 'Hora', 'Situação', 'Quantidade', 'Observação'];

        } else if (reportName === 'portaria') {
            rows = await reportModel.getPortaria(dataInicio, dataFim, codigoTransportadora);
            headers = ['Portaria', 'Veículo', 'Placa', 'Transportadora', 'Entrada', 'Saída', 'Observação'];

        } else if (reportName === 'transportadoras') {
            rows = await reportModel.getTransportadoras(dataInicio, dataFim, codigoTransportadora);
            headers = ['Transportadora', 'Quantidade de Agendamentos'];
        }

        if (!rows || rows.length === 0) {
            return res.status(204).send();
        }

        const doc = new PDFDocument({ layout: 'landscape' });
        gerarCabecalhoPDF(doc, reportName, userName, dataInicio, dataFim);
        gerarTabelaPDF(doc, headers, rows);
        gerarPDF(doc, res);

    } catch (error) {
        console.error('Erro ao gerar o relatório:', error);
        res.status(500).send(`Erro ao gerar o relatório: ${error.message}`);
    }
};

module.exports = { gerarRelatorio };