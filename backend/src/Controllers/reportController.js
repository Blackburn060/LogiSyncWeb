const reportModel = require("../models/reportModel");

const gerarRelatorio = async (req, res) => {
  const { reportName } = req.params;
  const {
    dataInicio,
    dataFim,
    codigoTransportadora,
    codigoProduto,
    codigoSafra,
    situacao,
    tipoAgendamento,
  } = req.body;

  try {
    let rows = [];
    let headers = [];

    if (reportName === "agendamentos") {
      rows = await reportModel.getAgendamentos(
        dataInicio,
        dataFim,
        codigoTransportadora,
        codigoProduto,
        codigoSafra,
        situacao,
        tipoAgendamento
      );
      headers = [
        "Agendamento",
        "Usuário",
        "Veículo",
        "Produto",
        "Transportadora",
        "Data",
        "Hora",
        "Situação",
        "Quantidade",
        "Observação",
      ];
    } else if (reportName === "portaria") {
      rows = await reportModel.getPortaria(
        dataInicio,
        dataFim,
        codigoTransportadora
      );
      headers = [
        "Portaria",
        "Veículo",
        "Placa",
        "Transportadora",
        "Entrada",
        "Saída",
        "Observação",
      ];
    } else if (reportName === "transportadoras") {
      rows = await reportModel.getTransportadoras(
        dataInicio,
        dataFim,
        codigoTransportadora
      );
      headers = ["Transportadora", "Quantidade de Agendamentos"];
    }

    if (!rows || rows.length === 0) {
      return res
        .status(204)
        .json({
          message: "Nenhum dado encontrado para os parâmetros informados.",
        });
    }

    res.json({ headers, rows });
  } catch (error) {
    console.error("Erro ao gerar o relatório:", error);
    res
      .status(500)
      .json({ message: `Erro ao gerar o relatório: ${error.message}` });
  }
};

module.exports = { gerarRelatorio };
