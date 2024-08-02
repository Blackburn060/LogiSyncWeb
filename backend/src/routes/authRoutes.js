const express = require('express');
const router = express.Router();
const { login, refreshAccessToken } = require('../Controllers/authController');

router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);

module.exports = router;
