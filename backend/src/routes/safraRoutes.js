const express = require('express');
const router = express.Router();
const safraController = require('../Controllers/safraController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/safras',authMiddleware, safraController.listarSafras);
router.post('/safras',authMiddleware, safraController.adicionarSafra);
router.put('/safras/:id',authMiddleware, safraController.atualizarSafra);
router.delete('/safras/:id',authMiddleware, safraController.deletarSafra);
router.get('/safras/:id', authMiddleware, safraController.getSafraById);

module.exports = router;
