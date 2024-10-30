const db = require('../../database');
const moment = require('moment-timezone');

// Função para normalizar as chaves do objeto veiculo para letras minúsculas
const normalizeKeys = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase()] = obj[key];
        return acc;
    }, {});
};

// Obter todos os veículos com filtros opcionais
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

// Obter um veículo pelo seu ID
const getVeiculoById = (codigoVeiculo) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastroveiculo WHERE CodigoVeiculo = ?';
        db.get(sql, [codigoVeiculo], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Adicionar um novo veículo
const addVeiculo = (veiculo) => {
    return new Promise((resolve, reject) => {
        const normalizedVeiculo = normalizeKeys(veiculo);
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const sql = `INSERT INTO cadastroveiculo (CodigoUsuario, NomeVeiculo, Placa, Marca, ModeloTipo, AnoFabricacao, Cor, CapacidadeCarga, SituacaoVeiculo, Bloqueado, DataGeracao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`;

        db.run(sql, [
            normalizedVeiculo.codigousuario, 
            normalizedVeiculo.nomeveiculo, 
            normalizedVeiculo.placa, 
            normalizedVeiculo.marca, 
            normalizedVeiculo.modelotipo, 
            normalizedVeiculo.anofabricacao, 
            normalizedVeiculo.cor, 
            normalizedVeiculo.capacidadecarga, 
            dataGeracao
        ], function(err) {
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
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        let sql = 'UPDATE cadastroveiculo SET ';
        let params = [];
        let updates = [];

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
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
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
