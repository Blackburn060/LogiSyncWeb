const express = require('express');
const router = express.Router();
const safraController = require('../Controllers/safraController');

router.get('/safras', safraController.listarSafras);
router.post('/safras', safraController.adicionarSafra);
router.put('/safras/:id', safraController.atualizarSafra);
router.delete('/safras/:id', safraController.deletarSafra);

module.exports = router;
