const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para gerar relatórios
router.post('/reports/:reportName', authMiddleware, reportController.gerarRelatorio);

module.exports = router;