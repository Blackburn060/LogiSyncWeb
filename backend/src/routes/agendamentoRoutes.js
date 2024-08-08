const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/agendamentos', authMiddleware, agendamentoController.listarAgendamentos);
router.get('/agendamentos-com-placa', authMiddleware, agendamentoController.listarAgendamentosComPlaca);
router.post('/agendamentos', authMiddleware, agendamentoController.adicionarAgendamento);
router.put('/agendamentos/:id', authMiddleware, agendamentoController.atualizarAgendamento);
router.put('/agendamentos/cancelar/:id', authMiddleware, agendamentoController.cancelarAgendamento);
router.delete('/agendamentos/:id', authMiddleware, agendamentoController.deletarAgendamento);

module.exports = router;
