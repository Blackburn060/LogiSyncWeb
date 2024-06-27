const db = require('../Config/database');
const moment = require('moment-timezone'); // Certifique-se de que esta linha está presente

// Buscar todos os horários
const getAllHorarios = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrohorarios';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Adicionar um novo horário
const addHorario = (horario) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = `INSERT INTO cadastrohorarios (DataAgendamento, HorarioAgendamento, SituacaoHorario, DataGeracao) VALUES (?, ?, ?, ?)`;
        db.run(sql, [horario.DataAgendamento, horario.HorarioAgendamento, horario.SituacaoHorario, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar um horário
const updateHorario = (horario, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastrohorarios SET ';
        let params = [];
        let updates = [];

        if (horario.DataAgendamento !== undefined) {
            updates.push('DataAgendamento = ?');
            params.push(horario.DataAgendamento);
        }
        if (horario.HorarioAgendamento !== undefined) {
            updates.push('HorarioAgendamento = ?');
            params.push(horario.HorarioAgendamento);
        }
        if (horario.SituacaoHorario !== undefined) {
            updates.push('SituacaoHorario = ?');
            params.push(horario.SituacaoHorario);
        }

        // Adicionar a atualização de DataAlteracao automaticamente
        updates.push('DataAlteracao = ?');
        params.push(dataAlteracao);

        if (updates.length === 0) {
            reject(new Error("No fields to update"));
            return;
        }

        sql += updates.join(', ') + ' WHERE CodigoHorario = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Deletar um horário
const deleteHorario = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM cadastrohorarios WHERE CodigoHorario = ?';
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
    getAllHorarios,
    addHorario,
    updateHorario,
    deleteHorario
};
