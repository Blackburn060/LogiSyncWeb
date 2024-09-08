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

// Função para buscar um usuário pelo ID
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrousuarios WHERE CodigoUsuario = ?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Função para adicionar um novo usuário com DataGeracao formatada
const addUser = (user) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const saltRounds = 10;

        // Hash da senha antes de salvar no banco de dados
        bcrypt.hash(user.senha, saltRounds, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const sql = `INSERT INTO cadastrousuarios (NomeCompleto, CodigoTransportadora, Email, Senha, TipoUsuario, SituacaoUsuario, NumeroCelular, DataGeracao, CPF) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                db.run(sql, [user.nomeCompleto, user.codigoTransportadora, user.email.toLowerCase(), hashedPassword, user.tipoUsuario, 1, user.numeroCelular, dataGeracao, user.cpf], function(err) {
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

        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        let sql = 'UPDATE cadastrousuarios SET ';
        let params = [];
        let updates = [];

        // Verifica se a senha está presente e faz o hash se necessário
        if (user.senha) {
            try {
                const hashedPassword = await bcrypt.hash(user.senha, 10);
                user.senha = hashedPassword;
            } catch (err) {
                return reject(err);
            }
        }


        Object.keys(user).forEach(key => {
            // Verifica se a chave tem um valor definido e não é 'DataGeracao' ou 'DataAlteracao'
            if (user[key] !== undefined && key !== 'DataGeracao' && key !== 'DataAlteracao') {
                updates.push(`${key} = ?`);
                params.push(user[key]);
            }
        });

        if (updates.length === 0) {
            console.error('Erro: No fields to update'); 
            return reject(new Error("No fields to update"));
        }

        // Adiciona a DataAlteracao ao SQL e aos parâmetros
        updates.push('DataAlteracao = ?');
        params.push(dataAlteracao);

        sql += updates.join(', ') + ' WHERE CodigoUsuario = ?';
        params.push(id);

        // Executa o SQL
        db.run(sql, params, function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.changes);
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

// Função para encontrar um usuário pelo ID
const findUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrousuarios WHERE CodigoUsuario = ?';
        db.get(sql, [id], (err, row) => {
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
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
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
    getUserById, 
    findUserByEmail,
    findUserById,
    deleteUser
};
