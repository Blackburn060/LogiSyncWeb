const express = require('express');
const AuthController = require('../Controllers/authController');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/registro', AuthController.registro);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
