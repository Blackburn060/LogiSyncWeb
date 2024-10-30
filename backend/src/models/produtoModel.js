const db = require('../../database');
const moment = require('moment-timezone');

// Buscar todos os produtos
const getAllProdutos = (filters = {}) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM cadastroprodutos WHERE 1=1';
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

// Adicionar um novo produto
const addProduto = (produto) => {
    return new Promise((resolve, reject) => {
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const sql = `INSERT INTO cadastroprodutos (DescricaoProduto, Categoria, SituacaoProduto, DataGeracao, UsuarioAlteracao) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [produto.DescricaoProduto, produto.Categoria, produto.SituacaoProduto, dataGeracao, produto.UsuarioAlteracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

const getProdutoById = (codigoProduto) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastroprodutos WHERE CodigoProduto = ?';
        db.get(sql, [codigoProduto], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);  // Retorna a linha correspondente ao produto
            }
        });
    });
};

// Atualizar um produto
const updateProduto = (produto, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        let sql = 'UPDATE cadastroprodutos SET ';
        let params = [];
        let updates = [];

        Object.entries(produto).forEach(([key, value]) => {
            if (value !== undefined && key !== 'DataGeracao' && key !== 'DataAlteracao') {
                updates.push(`${key} = ?`);
                params.push(value);
            }
        });

        // Add update timestamp and user who made the update
        if (updates.length > 0) {
            updates.push('DataAlteracao = ?', 'UsuarioAlteracao = ?');
            params.push(dataAlteracao, produto.UsuarioAlteracao);
        } else {
            reject(new Error("No fields to update"));
            return;
        }

        sql += updates.join(', ') + ' WHERE CodigoProduto = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Deletar um produto (soft delete)
const deleteProduto = (id, UsuarioAlteracao) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const sql = 'UPDATE cadastroprodutos SET SituacaoProduto = 0, DataAlteracao = ?, UsuarioAlteracao = ? WHERE CodigoProduto = ?';
        db.run(sql, [dataAlteracao, UsuarioAlteracao, id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

module.exports = {
    getAllProdutos,
    addProduto,
    getProdutoById,
    updateProduto,
    deleteProduto
};
