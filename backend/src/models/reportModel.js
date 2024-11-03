const db = require("../Config/database");
const moment = require("moment");

// Função para obter agendamentos de acordo com os filtros
const getAgendamentos = (
  dataInicio,
  dataFim,
  codigoTransportadora,
  codigoProduto,
  codigoSafra,
  situacao,
  tipoAgendamento
) => {
  return new Promise((resolve, reject) => {
    let query = `
            SELECT ag.CodigoAgendamento, us.NomeCompleto AS Usuario, ve.Placa AS Veiculo,
                   pr.DescricaoProduto AS Produto, tr.Nome AS Transportadora,
                   ag.DataAgendamento, ag.HoraAgendamento, ag.SituacaoAgendamento,
                   ag.QuantidadeAgendamento AS Quantidade, ag.Observacao AS Observacao
            FROM agendamentos ag
            JOIN cadastrousuarios us ON ag.CodigoUsuario = us.CodigoUsuario
            JOIN cadastroveiculo ve ON ag.CodigoVeiculo = ve.CodigoVeiculo
            JOIN cadastroprodutos pr ON ag.CodigoProduto = pr.CodigoProduto
            JOIN cadastrotransportadora tr ON ag.CodigoTransportadora = tr.CodigoTransportadora
            WHERE ag.DataAgendamento BETWEEN ? AND ?`;

    let params = [dataInicio, dataFim];

    if (codigoTransportadora) {
      query += " AND ag.CodigoTransportadora = ?";
      params.push(codigoTransportadora);
    }
    if (codigoProduto) {
      query += " AND ag.CodigoProduto = ?";
      params.push(codigoProduto);
    }
    if (codigoSafra) {
      query += " AND ag.CodigoSafra = ?";
      params.push(codigoSafra);
    }
    if (situacao) {
      query += " AND ag.SituacaoAgendamento = ?";
      params.push(situacao);
    }
    if (tipoAgendamento) {
      query += " AND ag.TipoAgendamento = ?";
      params.push(tipoAgendamento);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const formattedRows = rows.map((row) => ({
          ...row,
          DataAgendamento: moment(row.DataAgendamento).format("DD/MM/YYYY"),
        }));
        resolve(formattedRows);
      }
    });
  });
};

// Função para obter os dados da portaria
const getPortaria = (dataInicio, dataFim, codigoTransportadora) => {
  return new Promise((resolve, reject) => {
    let query = `
            SELECT dp.CodigoPortaria, ve.NomeVeiculo, ve.Placa,
                   tr.Nome AS Transportadora, dp.DataHoraEntrada, dp.DataHoraSaida,
                   dp.ObservacaoPortaria
            FROM dadosportaria dp
            JOIN agendamentos ag ON dp.CodigoAgendamento = ag.CodigoAgendamento
            JOIN cadastroveiculo ve ON ag.CodigoVeiculo = ve.CodigoVeiculo
            JOIN cadastrotransportadora tr ON ag.CodigoTransportadora = tr.CodigoTransportadora
            WHERE dp.DataHoraEntrada BETWEEN ? AND ?`;
    let params = [dataInicio, dataFim];

    if (codigoTransportadora) {
      query += " AND ag.CodigoTransportadora = ?";
      params.push(codigoTransportadora);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const formattedRows = rows.map((row) => ({
          ...row,
          DataHoraEntrada: moment(row.DataHoraEntrada).format(
            "DD/MM/YYYY HH:mm:ss"
          ),
          DataHoraSaida: moment(row.DataHoraSaida).format(
            "DD/MM/YYYY HH:mm:ss"
          ),
        }));
        resolve(formattedRows);
      }
    });
  });
};

// Função para obter o relatório de transportadoras
const getTransportadoras = (dataInicio, dataFim, codigoTransportadora) => {
  return new Promise((resolve, reject) => {
    let query = `
            SELECT tr.Nome, COUNT(ag.CodigoAgendamento) AS QuantidadeAgendamentos
            FROM cadastrotransportadora tr
            JOIN agendamentos ag ON tr.CodigoTransportadora = ag.CodigoTransportadora
            WHERE ag.DataAgendamento BETWEEN ? AND ?
            GROUP BY tr.Nome`;
    let params = [dataInicio, dataFim];

    if (codigoTransportadora) {
      query += " HAVING tr.CodigoTransportadora = ?";
      params.push(codigoTransportadora);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  getAgendamentos,
  getPortaria,
  getTransportadoras,
};
