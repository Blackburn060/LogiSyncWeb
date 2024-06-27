const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todos os veículos
const getAllVeiculos = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastroveiculo';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Adicionar um novo veículo

const addVeiculo = (veiculo) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO cadastroveiculo (CodigoUsuario, NomeVeiculo, Placa, Marca, ModeloTipo, AnoFabricacao, Cor, CapacidadeCarga, SituacaoVeiculo, Bloqueado, DataGeracao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [veiculo.CodigoUsuario, veiculo.NomeVeiculo, veiculo.Placa, veiculo.Marca, veiculo.ModeloTipo, veiculo.AnoFabricacao, veiculo.Cor, veiculo.CapacidadeCarga, veiculo.SituacaoVeiculo, veiculo.Bloqueado, dataGeracao], function(err) {
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
            if (value !== undefined && !['DataGeracao', 'DataAlteracao'].includes(key)) {  // Ignora campos de data
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

// Deletar um veículo
const deleteVeiculo = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM cadastroveiculo WHERE CodigoVeiculo = ?';
        db.run(sql, id, function(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.changes);
            }
        });
    });
};

module.exports = {
    getAllVeiculos,
    addVeiculo,
    updateVeiculo,
    deleteVeiculo
};
