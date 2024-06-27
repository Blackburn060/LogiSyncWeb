const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todas as safras
const getAllSafras = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrosafra';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Adicionar uma nova safra
const addSafra = (safra) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = `INSERT INTO cadastrosafra (AnoSafra, SituacaoSafra, DataGeracao) VALUES (?, ?, ?)`;
        db.run(sql, [safra.AnoSafra, safra.SituacaoSafra, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar uma safra
const updateSafra = (safra, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastrosafra SET ';
        let params = [];
        let updates = [];

        if (safra.AnoSafra !== undefined) {
            updates.push('AnoSafra = ?');
            params.push(safra.AnoSafra);
        }
        if (safra.SituacaoSafra !== undefined) {
            updates.push('SituacaoSafra = ?');
            params.push(safra.SituacaoSafra);
        }

        updates.push('DataAlteracao = ?');
        params.push(dataAlteracao);

        if (updates.length > 0) {
            sql += updates.join(', ') + ' WHERE CodigoSafra = ?';
            params.push(id);

            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        } else {
            reject(new Error("No fields to update"));
        }
    });
};


// Deletar uma safra
const deleteSafra = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM cadastrosafra WHERE CodigoSafra = ?';
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
    getAllSafras,
    addSafra,
    updateSafra,
    deleteSafra
};
