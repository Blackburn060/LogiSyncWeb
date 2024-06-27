const express = require('express');
const router = express.Router();
const transportadoraController = require('../Controllers/transportadoraController');

router.get('/transportadoras', transportadoraController.listarTransportadoras);
router.post('/transportadoras', transportadoraController.adicionarTransportadora);
router.put('/transportadoras/:id', transportadoraController.atualizarTransportadora);
router.delete('/transportadoras/:id', transportadoraController.deletarTransportadora);

module.exports = router;
