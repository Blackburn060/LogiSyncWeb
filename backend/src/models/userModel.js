const db = require('../Config/database');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');

// Função para buscar todos os usuários com filtros dinâmicos
const getAllUsers = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM cadastrousuarios WHERE 1=1';
        let params = [];

        Object.keys(filters).forEach(key => {
            sql += ` AND ${key} LIKE ?`;
            params.push(`%${filters[key]}%`);
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

// Função para adicionar um novo usuário com DataGeracao formatada
const addUser = (user) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const saltRounds = 10;

        // Hash da senha antes de salvar no banco de dados
        bcrypt.hash(user.Senha, saltRounds, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const sql = `INSERT INTO cadastrousuarios (NomeCompleto, CodigoTransportadora, Email, Senha, TipoUsuario, SituacaoUsuario, NumeroCelular, DataGeracao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                db.run(sql, [user.NomeCompleto, user.CodigoTransportadora, user.Email, hashedPassword, user.TipoUsuario, user.SituacaoUsuario, user.NumeroCelular, dataGeracao], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
            }
        });
    });
};

// Função para atualizar um usuário com DataAlteracao formatada
const updateUser = (user, id) => {
    return new Promise(async (resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastrousuarios SET ';
        let params = [];
        let updates = [];

        // Verifica se a senha está presente e faz o hash se necessário
        if (user.Senha) {
            try {
                const hashedPassword = await bcrypt.hash(user.Senha, 10);
                user.Senha = hashedPassword;
            } catch (err) {
                return reject(err);
            }
        }

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

// Função para encontrar um usuário pelo email
const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrousuarios WHERE Email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Função para "deletar" (inativar) um usuário
const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = 'UPDATE cadastrousuarios SET SituacaoUsuario = 0, DataAlteracao = ? WHERE CodigoUsuario = ?';
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
    getAllUsers,
    addUser,
    updateUser,
    findUserByEmail,
    deleteUser
};
