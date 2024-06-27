const express = require('express');
const router = express.Router();
const portariaController = require('../Controllers/portariaController');

router.get('/portarias', portariaController.listarPortarias);
router.post('/portarias', portariaController.adicionarPortaria);
router.put('/portarias/:id', portariaController.atualizarPortaria);
router.delete('/portarias/:id', portariaController.deletarPortaria);

module.exports = router;
