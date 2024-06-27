const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todas as transportadoras
const getAllTransportadoras = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrotransportadora';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Adicionar uma nova transportadora
const addTransportadora = (transportadora) => {
    console.log("Recebendo para adição:", transportadora); // Isto mostrará os dados recebidos
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = `INSERT INTO cadastrotransportadora (Nome, NomeFantasia, CNPJ, DataGeracao) VALUES (?, ?, ?, ?)`;
        db.run(sql, [transportadora.Nome, transportadora.NomeFantasia, transportadora.CNPJ, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};


// Atualizar uma transportadora
const updateTransportadora = (transportadora, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastrotransportadora SET ';
        let params = [];
        let updates = [];

        if (transportadora.Nome !== undefined) {
            updates.push('Nome = ?');
            params.push(transportadora.Nome);
        }
        if (transportadora.CNPJ !== undefined) {
            updates.push('CNPJ = ?');
            params.push(transportadora.CNPJ);
        }
        if (transportadora.NomeFantasia !== undefined) {
            updates.push('NomeFantasia = ?');
            params.push(transportadora.NomeFantasia);
        }
        

        updates.push('DataAlteracao = ?');
        params.push(dataAlteracao);

        if (updates.length > 0) {
            sql += updates.join(', ') + ' WHERE CodigoTransportadora = ?';
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


// Deletar uma transportadora
const deleteTransportadora = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM cadastrotransportadora WHERE CodigoTransportadora = ?';
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
    getAllTransportadoras,
    addTransportadora,
    updateTransportadora,
    deleteTransportadora
};
