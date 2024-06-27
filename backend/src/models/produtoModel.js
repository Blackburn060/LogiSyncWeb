const db = require('../Config/database');
const moment = require('moment-timezone');

// Buscar todos os produtos
const getAllProdutos = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastroprodutos';
        db.all(sql, [], (err, rows) => {
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
        const sql = `INSERT INTO cadastroprodutos (DescricaoProduto, Categoria, DataGeracao) VALUES (?, ?, ?)`;
        db.run(sql, [produto.DescricaoProduto, produto.Categoria, dataGeracao], function(err) {
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
        const sql = 'DELETE FROM cadastroprodutos WHERE CodigoProduto = ?';
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
    getAllProdutos,
    addProduto,
    updateProduto,
    deleteProduto
};
