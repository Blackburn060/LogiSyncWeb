const express = require('express');
const router = express.Router();
const HorarioController = require('../Controllers/horarioController');

router.get('/horarios', HorarioController.getHorarios);
router.get('/horarios-disponiveis', HorarioController.getHorariosDisponiveisPorData);
router.put('/horarios/:id', HorarioController.updateHorario);

module.exports = router;
