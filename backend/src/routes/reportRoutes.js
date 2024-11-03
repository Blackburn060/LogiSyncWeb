const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/reports/:reportName', authMiddleware, reportController.gerarRelatorio);

module.exports = router;