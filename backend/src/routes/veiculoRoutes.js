const express = require('express');
const router = express.Router();
const veiculoController = require('../Controllers/veiculoController');

router.get('/veiculos', veiculoController.listarVeiculos);
router.post('/veiculos', veiculoController.adicionarVeiculo);
router.put('/veiculos/:id', veiculoController.atualizarVeiculo);
router.delete('/veiculos/:id', veiculoController.deletarVeiculo);

module.exports = router;
