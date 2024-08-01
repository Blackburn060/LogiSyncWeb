// src/models/horarioModel.js
const db = require('../config/database');

const getHorarios = () => {
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

const updateHorario = (id, day, status) => {
    const dayColumn = `${day}_status`;
    return new Promise((resolve, reject) => {
        const sql = `UPDATE cadastrohorarios SET ${dayColumn} = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(sql, [status, id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id, changes: this.changes });
            }
        });
    });
};

module.exports = {
    getHorarios,
    updateHorario
};
