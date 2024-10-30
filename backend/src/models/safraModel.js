const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todas as safras com filtros
const getAllSafras = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM cadastrosafra WHERE 1=1';
        let params = [];

        // Adiciona condições SQL com base nos filtros passados
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined) {
                sql += ` AND ${key} = ?`;
                params.push(filters[key]);
            }
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

// Adicionar uma nova safra
const addSafra = (safra) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        
        // Adicionando AnoSafra, SituacaoSafra, DataGeracao e UsuarioAlteracao
        const sql = `
            INSERT INTO cadastrosafra (AnoSafra, SituacaoSafra, DataGeracao, UsuarioAlteracao)
            VALUES (?, ?, ?, ?)
        `;
        
        db.run(sql, [safra.AnoSafra, safra.SituacaoSafra, dataGeracao, safra.UsuarioAlteracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

const updateSafra = (safra, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        let sql = 'UPDATE cadastrosafra SET ';
        let params = [];
        let updates = [];

        Object.keys(safra).forEach(key => {
            if (safra[key] !== undefined && key !== 'DataGeracao' && key !== 'DataAlteracao') {
                updates.push(`${key} = ?`);
                params.push(safra[key]);
            }
        });

        if (updates.length === 0) {
            reject(new Error("No fields to update"));
            return;
        }

        updates.push('DataAlteracao = ?');
        params.push(dataAlteracao);

        sql += updates.join(', ') + ' WHERE CodigoSafra = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Deletar uma safra
const deleteSafra = (id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const sql = 'UPDATE cadastrosafra SET SituacaoSafra = 0, DataAlteracao = ? WHERE CodigoSafra = ?';
        db.run(sql,[dataAlteracao, id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};
const getSafraById = (codigoSafra) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrosafra WHERE CodigoSafra = ?';
        db.get(sql, [codigoSafra], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);  // Retorna a linha correspondente à safra
            }
        });
    });
};

module.exports = {
    getAllSafras,
    getSafraById,
    addSafra,
    updateSafra,
    deleteSafra
};
