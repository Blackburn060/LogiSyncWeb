const db = require('../Config/database');
const moment = require('moment-timezone');

const getAllVeiculos = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM cadastroveiculo WHERE 1=1';
        let params = [];

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
const getVeiculoById = (codigoVeiculo) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastroveiculo WHERE CodigoVeiculo = ?';
        db.get(sql, [codigoVeiculo], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row); // Retorna o veículo específico
            }
        });
    });
};
// Adicionar um novo veículo
const addVeiculo = (veiculo) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY');
        const sql = `INSERT INTO cadastroveiculo (CodigoUsuario, NomeVeiculo, Placa, Marca, ModeloTipo, AnoFabricacao, Cor, CapacidadeCarga, SituacaoVeiculo, Bloqueado, DataGeracao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`;
        db.run(sql, [veiculo.CodigoUsuario, veiculo.NomeVeiculo, veiculo.Placa, veiculo.Marca, veiculo.ModeloTipo, veiculo.AnoFabricacao, veiculo.Cor, veiculo.CapacidadeCarga, veiculo.Bloqueado, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar um veículo
const updateVeiculo = (veiculo, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastroveiculo SET ';
        let params = [];
        let updates = [];

        // Verifica cada campo e adiciona à lista de updates se não for indefinido
        Object.entries(veiculo).forEach(([key, value]) => {
            if (value !== undefined && !['DataGeracao', 'DataAlteracao'].includes(key)) {
                updates.push(`${key} = ?`);
                params.push(value);
            }
        });

        if (updates.length > 0) {
            updates.push('DataAlteracao = ?');
            params.push(dataAlteracao);
        } else {
            reject(new Error("No fields to update"));
            return;
        }

        sql += updates.join(', ') + ' WHERE CodigoVeiculo = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Inativar um veículo (atualizar SituacaoVeiculo para 0)
const deleteVeiculo = (id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = 'UPDATE cadastroveiculo SET SituacaoVeiculo = 0, DataAlteracao = ? WHERE CodigoVeiculo = ?';
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
    getAllVeiculos,
    addVeiculo,
    getVeiculoById, 
    updateVeiculo,
    deleteVeiculo
};
