const express = require('express');
const router = express.Router();
const agendamentoController = require('../Controllers/agendamentoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/agendamentos', authMiddleware, agendamentoController.listarAgendamentos);
router.get('/agendamentos-com-placa', authMiddleware, agendamentoController.listarAgendamentosComPlaca);
router.post('/agendamentos', authMiddleware, agendamentoController.adicionarAgendamento);
router.put('/agendamentos/:id', authMiddleware, agendamentoController.atualizarAgendamento);
router.put('/agendamentos/cancelar/:id', authMiddleware, agendamentoController.cancelarAgendamento);
router.delete('/agendamentos/:id', authMiddleware, agendamentoController.deletarAgendamento);
router.post('/agendamentos/indisponibilidade', authMiddleware, agendamentoController.registrarIndisponibilidadeHorario);
router.get('/agendamentos/indisponibilidades', authMiddleware, agendamentoController.listarIndisponibilidades);
router.delete('/agendamentos/indisponibilidade/:id', authMiddleware, agendamentoController.deletarIndisponibilidade); 
router.get('/agendamentos-por-data', authMiddleware, agendamentoController.listarAgendamentosPorData);
router.get('/agendamentos/status', authMiddleware, agendamentoController.listarAgendamentosPorStatus);

module.exports = router;
