const db = require('../Config/database');
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
        const dataGeracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = `INSERT INTO cadastroprodutos (DescricaoProduto, Categoria, SituacaoProduto, DataGeracao) VALUES (?, ?, ?, ?)`;
        db.run(sql, [produto.DescricaoProduto, produto.Categoria, produto.SituacaoProduto, dataGeracao], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar um produto
const updateProduto = (produto, id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        let sql = 'UPDATE cadastroprodutos SET ';
        let params = [];
        let updates = [];

        Object.entries(produto).forEach(([key, value]) => {
            if (value !== undefined && key !== 'DataGeracao' && key !== 'DataAlteracao') {
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

        sql += updates.join(', ') + ' WHERE CodigoProduto = ?';
        params.push(id);

        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};


// Deletar um produto
const deleteProduto = (id) => {
    return new Promise((resolve, reject) => {
        const dataAlteracao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm');
        const sql = 'UPDATE cadastroprodutos SET SituacaoProduto = 0, DataAlteracao = ? WHERE CodigoProduto = ?';
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
    getAllProdutos,
    addProduto,
    updateProduto,
    deleteProduto
};
