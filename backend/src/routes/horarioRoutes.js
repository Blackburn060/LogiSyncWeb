const express = require('express');
const router = express.Router();
const horarioController = require('../Controllers/horarioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/horarios',authMiddleware, horarioController.listarHorarios);
router.post('/horarios',authMiddleware, horarioController.adicionarHorario);
router.put('/horarios/:id',authMiddleware, horarioController.atualizarHorario);
router.delete('/horarios/:id',authMiddleware, horarioController.deletarHorario);

module.exports = router;
