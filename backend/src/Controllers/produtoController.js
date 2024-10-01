const produtoModel = require('../models/produtoModel');

const listarProdutos = async (req, res) => {
    try {
        const filters = req.query;
        const produtos = await produtoModel.getAllProdutos(filters);
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
const getProdutoById = async (req, res) => {
    try {
        const { id } = req.params;  // Captura o ID da URL
        const produto = await produtoModel.getProdutoById(id);  // Chama o model para buscar o produto

        if (!produto) {
            return res.status(404).send({ message: "Produto não encontrado." });
        }

        res.json(produto);  // Retorna o produto encontrado
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar produto: " + error.message });
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
            res.send({ message: "Produto inativado com sucesso" });
        } else {
            res.status(404).send({ message: "Produto não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao inativar produto: " + error.message });
    }
};

module.exports = {
    listarProdutos,
    adicionarProduto,
    atualizarProduto,
    getProdutoById,
    deletarProduto
};
