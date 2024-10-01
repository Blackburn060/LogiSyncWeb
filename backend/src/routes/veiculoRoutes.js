const express = require('express');
const router = express.Router();
const veiculoController = require('../Controllers/veiculoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/veiculos', authMiddleware, veiculoController.listarVeiculos);
router.post('/veiculos', authMiddleware, veiculoController.adicionarVeiculo);
router.put('/veiculos/:id', authMiddleware, veiculoController.atualizarVeiculo);
router.delete('/veiculos/:id', authMiddleware, veiculoController.deletarVeiculo);
router.get('/veiculos/:id', authMiddleware, veiculoController.obterVeiculoPorId);

router.post('/veiculos/public', veiculoController.adicionarVeiculoPublic);

module.exports = router;