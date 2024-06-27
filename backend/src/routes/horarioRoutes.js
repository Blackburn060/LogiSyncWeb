const express = require('express');
const router = express.Router();
const horarioController = require('../Controllers/horarioController');

router.get('/horarios', horarioController.listarHorarios);
router.post('/horarios', horarioController.adicionarHorario);
router.put('/horarios/:id', horarioController.atualizarHorario);
router.delete('/horarios/:id', horarioController.deletarHorario);

module.exports = router;
