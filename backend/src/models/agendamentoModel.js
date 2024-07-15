const db = require('../Config/database');

// Buscar todos os agendamentos
const getAllAgendamentos = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM agendamentos WHERE 1=1';
        let params = [];

        Object.keys(filters).forEach(key => {
            sql += ` AND ${key} LIKE ?`;
            params.push(`%${filters[key]}%`);
        });

        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Adicionar um novo agendamento
const addAgendamento = (agendamento) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO agendamentos (CodigoUsuario, CodigoVeiculo, CodigoProduto, CodigoTransportadora, CodigoSafra, CodigoHorario, ArquivoAnexado, Observacao, DataAgendamento, HoraAgendamento, UsuarioAprovacao, MotivoRecusa, QuantidadeAgendamento, SituacaoAgendamento, TipoAgendamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [
            agendamento.CodigoUsuario, agendamento.CodigoVeiculo, agendamento.CodigoProduto, 
            agendamento.CodigoTransportadora, agendamento.CodigoSafra, agendamento.CodigoHorario, 
            agendamento.ArquivoAnexado, agendamento.Observacao, agendamento.DataAgendamento, 
            agendamento.HoraAgendamento, agendamento.UsuarioAprovacao, agendamento.MotivoRecusa, 
            agendamento.QuantidadeAgendamento, agendamento.SituacaoAgendamento, agendamento.TipoAgendamento
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
        const sql = `UPDATE agendamentos SET Observacao = ?, UsuarioAprovacao = ?, MotivoRecusa = ?, SituacaoAgendamento = ? WHERE CodigoAgendamento = ?`;
        db.run(sql, [agendamento.Observacao, agendamento.UsuarioAprovacao, agendamento.MotivoRecusa, agendamento.SituacaoAgendamento, id], function(err) {
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

module.exports = {
    getAllAgendamentos,
    addAgendamento,
    updateAgendamento,
    deleteAgendamento
};
