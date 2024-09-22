const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/usuarios', authMiddleware, userController.listarUsuarios);
router.get('/usuarios/:id', authMiddleware, userController.listarUsuario);
router.put('/usuarios/:id', authMiddleware, userController.atualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, userController.deletarUsuario);
router.get('/verificar-email', authMiddleware, userController.verificarEmailExistente); 

router.get('/verificar-email/public', userController.verificarEmailExistente);
router.post('/usuarios/public', userController.adicionarUsuarioPublic);

module.exports = router;