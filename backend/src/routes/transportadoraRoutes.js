const express = require('express');
const router = express.Router();
const transportadoraController = require('../Controllers/transportadoraController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/transportadoras', authMiddleware, transportadoraController.listarTransportadoras);
router.post('/transportadoras', authMiddleware, transportadoraController.adicionarTransportadora);
router.put('/transportadoras/:id', authMiddleware, transportadoraController.atualizarTransportadora);
router.delete('/transportadoras/:id', authMiddleware, transportadoraController.deletarTransportadora);
router.get('/transportadoras/:id', authMiddleware, transportadoraController.getTransportadoraById);

router.post('/transportadoras/public', transportadoraController.adicionarTransportadoraPublic); 

module.exports = router;