// src/routes/horarioRoutes.js
const express = require('express');
const router = express.Router();
const HorarioController = require('../Controllers/horarioController');

// Rota para obter todos os horários
router.get('/horarios', HorarioController.getHorarios);

// Rota para atualizar a disponibilidade de um horário
router.put('/horarios/:id', HorarioController.updateHorario);

module.exports = router;