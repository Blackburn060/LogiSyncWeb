const express = require('express');
const AuthController = require('../Controllers/authController');

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/registro', AuthController.registro);
router.post('/refresh-token', AuthController.refreshToken);

router.post('/recuperar-senha', AuthController.recuperarSenha);
router.post('/redefinir-senha', AuthController.redefinirSenha);
router.post('/resetar-senha-usuario', AuthController.resetarSenhaUsuario);

module.exports = router;
