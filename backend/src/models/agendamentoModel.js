const db = require('../Config/database');

// Buscar todos os agendamentos
const getAllAgendamentos = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM agendamentos WHERE 1=1';
        let params = [];

        if (filters.CodigoUsuario) {
            sql += ' AND CodigoUsuario = ?';
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

// função para buscar agendamentos com placa do veículo
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
        console.log('Recebendo novo agendamento:', agendamento);

        const sql = `INSERT INTO agendamentos (CodigoUsuario, CodigoVeiculo, CodigoProduto, CodigoTransportadora, CodigoSafra, ArquivoAnexado, Observacao, DataAgendamento, HoraAgendamento, UsuarioAprovacao, MotivoRecusa, QuantidadeAgendamento, SituacaoAgendamento, TipoAgendamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [
            agendamento.CodigoUsuario, agendamento.CodigoVeiculo, agendamento.CodigoProduto, 
            agendamento.CodigoTransportadora, agendamento.CodigoSafra, 
            agendamento.ArquivoAnexado, agendamento.Observacao, agendamento.DataAgendamento, 
            agendamento.HoraAgendamento, agendamento.UsuarioAprovacao, agendamento.MotivoRecusa, 
            agendamento.QuantidadeAgendamento, agendamento.SituacaoAgendamento, agendamento.TipoAgendamento
        ], function(err) {
            if (err) {
                console.error('Erro ao inserir agendamento no banco de dados:', err);
                reject(err);
            } else {
                console.log('Agendamento inserido com sucesso. ID:', this.lastID);
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

// Registrar indisponibilidade
const registrarIndisponibilidade = (agendamento) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO agendamentos (CodigoUsuario, DataAgendamento, HoraAgendamento, TipoAgendamento, SituacaoAgendamento, DiaTodo) 
                     VALUES (?, ?, ?, 'Indisponível', 'Indisponível', ?)`;
        db.run(sql, [agendamento.CodigoUsuario, agendamento.DataAgendamento, agendamento.HoraAgendamento, agendamento.DiaTodo], function(err) {
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
            SELECT * FROM agendamentos 
            WHERE TipoAgendamento = 'Indisponível' AND DataAgendamento > DATE('now')
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
        const sql = 'DELETE FROM agendamentos WHERE CodigoAgendamento = ? AND TipoAgendamento = "Indisponível"';
        db.run(sql, [id], function (err) {
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
    cancelarAgendamento,
    registrarIndisponibilidade,
    getIndisponibilidades,
    deleteIndisponibilidade
};
