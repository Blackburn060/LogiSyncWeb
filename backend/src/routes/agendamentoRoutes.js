const express = require('express');
const router = express.Router();
const agendamentoController = require('../Controllers/agendamentoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/agendamentos',authMiddleware, agendamentoController.listarAgendamentos);
router.post('/agendamentos',authMiddleware, agendamentoController.adicionarAgendamento);
router.put('/agendamentos/:id',authMiddleware, agendamentoController.atualizarAgendamento);
router.delete('/agendamentos/:id',authMiddleware, agendamentoController.deletarAgendamento);

module.exports = router;