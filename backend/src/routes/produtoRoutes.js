const express = require('express');
const router = express.Router();
const produtoController = require('../Controllers/produtoController');

router.get('/produtos', produtoController.listarProdutos);
router.post('/produtos', produtoController.adicionarProduto);
router.put('/produtos/:id', produtoController.atualizarProduto);
router.delete('/produtos/:id', produtoController.deletarProduto);

module.exports = router;