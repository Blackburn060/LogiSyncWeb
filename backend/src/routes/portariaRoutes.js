const express = require('express');
const router = express.Router();
const portariaController = require('../Controllers/portariaController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/portarias',authMiddleware, portariaController.listarPortarias);
router.post('/portarias',authMiddleware, portariaController.adicionarPortaria);
router.put('/portarias/:id',authMiddleware, portariaController.atualizarPortaria);
router.delete('/portarias/:id',authMiddleware, portariaController.deletarPortaria);
router.get('/portarias/:CodigoAgendamento', authMiddleware, portariaController.buscarPortariaPorAgendamento);

module.exports = router;
