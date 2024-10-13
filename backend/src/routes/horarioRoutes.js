const express = require('express');
const router = express.Router();
const HorarioController = require('../Controllers/horarioController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/horarios', authMiddleware, HorarioController.getHorarios);
router.get('/horarios-disponiveis', authMiddleware, HorarioController.getHorariosDisponiveisPorData);
router.put('/horarios/:id', authMiddleware, HorarioController.updateHorario);

module.exports = router;
