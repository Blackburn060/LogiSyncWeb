const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todos os usuários
// Model adaptado para aceitar filtros dinâmicos
const getAllUsers = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM cadastrousuarios WHERE 1=1';  // A condição sempre verdadeira inicia a cláusula WHERE
        let params = [];

        // Itera sobre os filtros e adiciona à cláusula WHERE
        Object.keys(filters).forEach(key => {
            sql += ` AND ${key} LIKE ?`;
            params.push(`%${filters[key]}%`);  // Adiciona wildcards para busca parcial
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


// Adicionar novo usuário com DataGeracao formatada
const addUser = (user) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = `INSERT INTO cadastrousuarios (NomeCompleto, CodigoTransportadora, Email, Senha, TipoUsuario, SituacaoUsuario, NumeroCelular, DataGeracao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [user.NomeCompleto, user.CodigoTransportadora, user.Email, user.Senha, user.TipoUsuario, user.SituacaoUsuario, user.NumeroCelular, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar usuário com DataAlteracao formatada
const updateUser = (user, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastrousuarios SET ';
        let params = [];
        let updates = [];

        Object.keys(user).forEach(key => {
            if (user[key] !== undefined && key !== 'DataGeracao' && key !== 'DataAlteracao') {
                updates.push(`${key} = ?`);
                params.push(user[key]);
            }
        });

        if (updates.length === 0) {
            reject(new Error("No fields to update"));
            return;
        }

        updates.push('DataAlteracao = ?');
        params.push(dataAlteracao);

        sql += updates.join(', ') + ' WHERE CodigoUsuario = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Deletar um usuário
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM cadastrousuarios WHERE CodigoUsuario = ?';
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
    getAllUsers,
    addUser,
    updateUser,
    deleteUser
};
