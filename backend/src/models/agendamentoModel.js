const db = require('../Config/database');

const getAllAgendamentos = (filters = {}) => {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM agendamentos WHERE 1=1';
      let params = [];
  
      if (filters.CodigoUsuario) {
        sql += ' AND CodigoUsuario = ?';
        params.push(filters.CodigoUsuario);
      }
  
      // Filtro por DataAgendamento
      if (filters.DataAgendamento) {
        sql += ' AND DataAgendamento = ?';
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
// Função para buscar agendamentos com placa do veículo
const getAllAgendamentosWithPlaca = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT ag.*, ve.Placa
            FROM agendamentos ag
            JOIN cadastroveiculo ve ON ag.CodigoVeiculo = ve.CodigoVeiculo
            WHERE 1=1
        `;
        let params = [];

        if (filters.CodigoUsuario) {
            sql += ' AND ag.CodigoUsuario = ?';
            params.push(filters.CodigoUsuario);
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

// Função para cancelar um agendamento
const cancelarAgendamento = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE agendamentos SET SituacaoAgendamento = "Cancelado" WHERE CodigoAgendamento = ?';
        db.run(sql, id, function(err) {
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
        db.run(sql, [
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
            agendamento.DiaTodo  // Adicionando DiaTodo ao agendamento
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
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
        db.run(sql, [
            agendamento.Observacao, 
            agendamento.UsuarioAprovacao, 
            agendamento.MotivoRecusa, 
            agendamento.SituacaoAgendamento, 
            agendamento.TipoAgendamento, 
            agendamento.DiaTodo,  // Atualizando DiaTodo
            id
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

// Deletar um agendamento
const deleteAgendamento = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM agendamentos WHERE CodigoAgendamento = ?';
        db.run(sql, id, function(err) {
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
        db.run(sql, [
            agendamento.CodigoUsuario, 
            agendamento.DataAgendamento, 
            agendamento.HoraAgendamento, 
            agendamento.TipoAgendamento, 
            agendamento.DiaTodo  // Registrando DiaTodo na indisponibilidade
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
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
        const sql = 'DELETE FROM agendamentos WHERE CodigoAgendamento = ? AND SituacaoAgendamento = "Indisponível"';
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

module.exports = {
    getAllAgendamentos,
    addAgendamento,
    updateAgendamento,
    getAllAgendamentosWithPlaca,
    deleteAgendamento,
    getAgendamentosPorData,
    cancelarAgendamento,
    registrarIndisponibilidade,
    getIndisponibilidades,
    deleteIndisponibilidade
};
