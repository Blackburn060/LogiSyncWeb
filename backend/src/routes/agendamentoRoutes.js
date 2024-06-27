const express = require('express');
const router = express.Router();
const agendamentoController = require('../Controllers/agendamentoController');

router.get('/agendamentos', agendamentoController.listarAgendamentos);
router.post('/agendamentos', agendamentoController.adicionarAgendamento);
router.put('/agendamentos/:id', agendamentoController.atualizarAgendamento);
router.delete('/agendamentos/:id', agendamentoController.deletarAgendamento);

module.exports = router;
