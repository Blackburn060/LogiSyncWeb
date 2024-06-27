const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

router.get('/usuarios', userController.listarUsuarios);
router.post('/usuarios', userController.adicionarUsuario);
router.put('/usuarios/:id', userController.atualizarUsuario);
router.delete('/usuarios/:id', userController.deletarUsuario);

module.exports = router;
