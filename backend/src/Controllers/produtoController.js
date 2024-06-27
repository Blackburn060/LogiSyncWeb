const produtoModel = require('../models/produtoModel');

const listarProdutos = async (req, res) => {
    try {
        const produtos = await produtoModel.getAllProdutos();
        res.json(produtos);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar produtos: " + error.message });
    }
};

const adicionarProduto = async (req, res) => {
    try {
        const id = await produtoModel.addProduto(req.body);
        res.status(201).send({ id: id, message: "Produto adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar produto: " + error.message });
    }
};

const atualizarProduto = async (req, res) => {
    try {
        const changes = await produtoModel.updateProduto(req.body, req.params.id);
        if (changes) {
            res.send({ message: "Produto atualizado com sucesso" });
        } else {
            res.status(404).send({ message: "Produto não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar produto: " + error.message });
    }
};

const deletarProduto = async (req, res) => {
    try {
        const changes = await produtoModel.deleteProduto(req.params.id);
        if (changes) {
            res.send({ message: "Produto deletado com sucesso" });
        } else {
            res.status(404).send({ message: "Produto não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar produto: " + error.message });
    }
};

module.exports = {
    listarProdutos,
    adicionarProduto,
    atualizarProduto,
    deletarProduto
};
