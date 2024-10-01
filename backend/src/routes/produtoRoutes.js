const express = require('express');
const router = express.Router();
const produtoController = require('../Controllers/produtoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/produtos',authMiddleware, produtoController.listarProdutos);
router.post('/produtos',authMiddleware, produtoController.adicionarProduto);
router.put('/produtos/:id',authMiddleware, produtoController.atualizarProduto);
router.delete('/produtos/:id',authMiddleware, produtoController.deletarProduto);
router.get('/produtos/:id',authMiddleware, produtoController.getProdutoById);

module.exports = router;