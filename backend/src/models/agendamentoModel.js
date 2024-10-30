const db = require("../../database");
const getAllAgendamentos = (filters = {}) => {
  return new Promise((resolve, reject) => {
    // Atualize a consulta SQL para excluir "Indisponível"
    let sql =
      'SELECT * FROM agendamentos WHERE SituacaoAgendamento <> "Indisponível"';
    let params = [];

    // Filtro por Código do Usuário, se necessário
    if (filters.CodigoUsuario) {
      sql += " AND CodigoUsuario = ?";
      params.push(filters.CodigoUsuario);
    }

    // Filtro por DataAgendamento, se necessário
    if (filters.DataAgendamento) {
      sql += " AND DataAgendamento = ?";
      params.push(filters.DataAgendamento);
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getAgendamentosPorData = (dataAgendamento) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT * 
        FROM agendamentos
        WHERE DataAgendamento = ?
        ORDER BY HoraAgendamento ASC
      `;
    db.all(sql, [dataAgendamento], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para listar os agendamentos com status "Aprovado", "Andamento" ou "Finalizado"
const getAgendamentosPorStatus = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        agendamentos.*,
        cadastroProdutos.DescricaoProduto,
        cadastroSafra.AnoSafra,
        dadosPortaria.DataHoraSaida,
        dadosPortaria.ObservacaoPortaria,
        dadosPortaria.MotivoRecusa
      FROM agendamentos
      LEFT JOIN cadastroProdutos ON agendamentos.CodigoProduto = cadastroProdutos.CodigoProduto
      LEFT JOIN cadastroSafra ON agendamentos.CodigoSafra = cadastroSafra.CodigoSafra
      LEFT JOIN dadosPortaria ON agendamentos.CodigoAgendamento = dadosPortaria.CodigoAgendamento
      WHERE agendamentos.SituacaoAgendamento IN ("Confirmado", "Andamento", "Finalizado", "Reprovado")
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


const updateStatusAgendamento = (CodigoAgendamento, novoStatus) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE agendamentos SET SituacaoAgendamento = ? WHERE CodigoAgendamento = ?`;
    db.run(sql, [novoStatus, CodigoAgendamento], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

const listarAgendamentosAdmin = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ag.*, 
       ve.Placa, 
       ve.Marca, 
       ve.AnoFabricacao, 
       ve.Cor, 
       ve.CapacidadeCarga,
       pr.DescricaoProduto, 
       pr.Categoria,
       sa.AnoSafra, 
       sa.SituacaoSafra,
       po.DataHoraEntrada, 
       po.DataHoraSaida, 
       po.ObservacaoPortaria,
       tr.Nome as NomeTransportadora -- Inclua o nome da transportadora
FROM agendamentos ag
JOIN cadastroveiculo ve ON ag.CodigoVeiculo = ve.CodigoVeiculo
LEFT JOIN cadastroprodutos pr ON ag.CodigoProduto = pr.CodigoProduto
LEFT JOIN cadastrosafra sa ON ag.CodigoSafra = sa.CodigoSafra
LEFT JOIN dadosportaria po ON ag.CodigoAgendamento = po.CodigoAgendamento
LEFT JOIN cadastrotransportadora tr ON ag.CodigoTransportadora = tr.CodigoTransportadora 
WHERE ag.SituacaoAgendamento <> 'Indisponível';

    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


module.exports = {
  listarAgendamentosAdmin,
  // outras funções do model aqui
};

// Função para buscar agendamentos com placa do veículo
const getAllAgendamentosWithPlaca = (filters = {}) => {
  return new Promise((resolve, reject) => {
      let sql = `
          SELECT ag.*, ve.Placa, p.DescricaoProduto, s.AnoSafra, po.DataHoraEntrada, po.DataHoraSaida, po.ObservacaoPortaria
          FROM agendamentos ag
          JOIN cadastroveiculo ve ON ag.CodigoVeiculo = ve.CodigoVeiculo
          LEFT JOIN cadastroprodutos p ON ag.CodigoProduto = p.CodigoProduto
          LEFT JOIN cadastrosafra s ON ag.CodigoSafra = s.CodigoSafra
          LEFT JOIN dadosportaria po ON ag.CodigoAgendamento = po.CodigoAgendamento
          WHERE 1=1
      `;
      let params = [];

      if (filters.CodigoUsuario) {
          sql += ' AND ag.CodigoUsuario = ?';
          params.push(filters.CodigoUsuario);
      }

      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(filters.limit) || 50);
      params.push(Number(filters.offset) || 0);

      db.all(sql, params, (err, rows) => {
          if (err) {
              reject(err);
          } else {
              resolve(rows);
          }
      });
  });
};


// Função para cancelar um agendamento
const cancelarAgendamento = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      'UPDATE agendamentos SET SituacaoAgendamento = "Cancelado" WHERE CodigoAgendamento = ?';
    db.run(sql, id, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

// Adicionar um novo agendamento
const addAgendamento = (agendamento) => {
  return new Promise((resolve, reject) => {
    const sql = `
            INSERT INTO agendamentos 
            (CodigoUsuario, CodigoVeiculo, CodigoProduto, CodigoTransportadora, CodigoSafra, ArquivoAnexado, Observacao, DataAgendamento, HoraAgendamento, UsuarioAprovacao, MotivoRecusa, QuantidadeAgendamento, SituacaoAgendamento, TipoAgendamento, DiaTodo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    db.run(
      sql,
      [
        agendamento.CodigoUsuario,
        agendamento.CodigoVeiculo,
        agendamento.CodigoProduto,
        agendamento.CodigoTransportadora,
        agendamento.CodigoSafra,
        agendamento.ArquivoAnexado,
        agendamento.Observacao,
        agendamento.DataAgendamento,
        agendamento.HoraAgendamento,
        agendamento.UsuarioAprovacao,
        agendamento.MotivoRecusa,
        agendamento.QuantidadeAgendamento,
        agendamento.SituacaoAgendamento,
        agendamento.TipoAgendamento,
        agendamento.DiaTodo, // Adicionando DiaTodo ao agendamento
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Atualizar um agendamento
const updateAgendamento = (agendamento, id) => {
  return new Promise((resolve, reject) => {
    const sql = `
            UPDATE agendamentos 
            SET Observacao = ?, UsuarioAprovacao = ?, MotivoRecusa = ?, SituacaoAgendamento = ?, TipoAgendamento = ?, DiaTodo = ? 
            WHERE CodigoAgendamento = ?
        `;

    // Garantindo que valores padrão sejam definidos, caso algum campo esteja faltando
    const observacao = agendamento.Observacao || "N/A"; // Define um valor padrão, se estiver null ou undefined
    const usuarioAprovacao = agendamento.UsuarioAprovacao || null;
    const motivoRecusa = agendamento.MotivoRecusa || null;
    const situacaoAgendamento = agendamento.SituacaoAgendamento || "Pendente";
    const tipoAgendamento = agendamento.TipoAgendamento || null;
    const diaTodo = agendamento.DiaTodo || 0;

    db.run(
      sql,
      [
        observacao,
        usuarioAprovacao,
        motivoRecusa,
        situacaoAgendamento,
        tipoAgendamento,
        diaTodo, // Atualizando DiaTodo
        id,
      ],
      function (err) {
        if (err) {
          console.error("Erro ao atualizar agendamento:", err);
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
  });
};
const getAgendamentoById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM agendamentos WHERE CodigoAgendamento = ?";
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Deletar um agendamento
const deleteAgendamento = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM agendamentos WHERE CodigoAgendamento = ?";
    db.run(sql, id, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

// Registrar indisponibilidade
const registrarIndisponibilidade = (agendamento) => {
  return new Promise((resolve, reject) => {
    const sql = `
            INSERT INTO agendamentos 
            (CodigoUsuario, DataAgendamento, HoraAgendamento, TipoAgendamento, SituacaoAgendamento, DiaTodo) 
            VALUES (?, ?, ?, ?, 'Indisponível', ?)
        `;
    db.run(
      sql,
      [
        agendamento.CodigoUsuario,
        agendamento.DataAgendamento,
        agendamento.HoraAgendamento,
        agendamento.TipoAgendamento,
        agendamento.DiaTodo, // Registrando DiaTodo na indisponibilidade
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
};

// Função para buscar indisponibilidades
const getIndisponibilidades = () => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT * 
            FROM agendamentos 
            WHERE SituacaoAgendamento = 'Indisponível' AND DataAgendamento >= DATE('now') 
            ORDER BY DataAgendamento ASC, HoraAgendamento ASC
        `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para excluir uma indisponibilidade
const deleteIndisponibilidade = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      'DELETE FROM agendamentos WHERE CodigoAgendamento = ? AND SituacaoAgendamento = "Indisponível"';
    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};
const getAgendamentosPorStatusEData = (data, status) => {
  return new Promise((resolve, reject) => {
    let sql = `
            SELECT ag.*, ve.Placa 
            FROM agendamentos ag
            LEFT JOIN cadastroveiculo ve ON ag.CodigoVeiculo = ve.CodigoVeiculo
            WHERE ag.DataAgendamento = ?
        `;

    const params = [data];

    // Adiciona filtro por status se fornecido
    if (status) {
      sql += ` AND ag.SituacaoAgendamento = ?`;
      params.push(status);
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
module.exports = {
  getAllAgendamentos,
  listarAgendamentosAdmin,
  getAgendamentosPorStatusEData,
  addAgendamento,
  updateStatusAgendamento,
  getAgendamentosPorStatus,
  getAgendamentoById,
  updateAgendamento,
  getAllAgendamentosWithPlaca,
  deleteAgendamento,
  getAgendamentosPorData,
  cancelarAgendamento,
  registrarIndisponibilidade,
  getIndisponibilidades,
  deleteIndisponibilidade,
};
