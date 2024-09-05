const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todas as transportadoras ativas
const getAllTransportadoras = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM cadastrotransportadora WHERE SituacaoTransportadora = 1';
        let params = [];

        // Adiciona condições SQL com base nos filtros passados
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== '') {
                sql += ` AND ${key} LIKE ?`;
                params.push(`%${filters[key]}%`);
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

// Buscar transportadora por ID, apenas se estiver ativa
const getTransportadoraById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrotransportadora WHERE CodigoTransportadora = ? AND SituacaoTransportadora = 1';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};


// Adicionar uma nova transportadora
const addTransportadora = (transportadora, userId) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sqlInsert = `INSERT INTO cadastrotransportadora (Nome, NomeFantasia, CNPJ, SituacaoTransportadora, DataGeracao) VALUES (?, ?, ?, ?, ?)`;

        db.run(sqlInsert, [transportadora.Nome, transportadora.NomeFantasia, transportadora.CNPJ, 1, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                const newCodigoTransportadora = this.lastID; 
                if (!newCodigoTransportadora) {
                    reject(new Error('Falha ao obter o CodigoTransportadora após a inserção'));
                } else {
                    
                    const sqlUpdateUser = 'UPDATE cadastrousuarios SET CodigoTransportadora = ?, DataAlteracao = ? WHERE CodigoUsuario = ?';
                    const dataAlteracao = dataGeracao;

                    db.run(sqlUpdateUser, [newCodigoTransportadora, dataAlteracao, userId], function(err) {
                        if (err) {
                            reject(err);
                        } else {

                            resolve({
                                CodigoTransportadora: newCodigoTransportadora,
                                Nome: transportadora.Nome,
                                NomeFantasia: transportadora.NomeFantasia,
                                CNPJ: transportadora.CNPJ,
                                SituacaoTransportadora: 1,
                                DataGeracao: dataGeracao
                            });
                        }
                    });
                }
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
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = 'UPDATE cadastrotransportadora SET SituacaoTransportadora = 0, DataAlteracao = ? WHERE CodigoTransportadora = ?';
        db.run(sql, [dataAlteracao, id], function(err) {
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
    deleteTransportadora,
    getTransportadoraById 
};
