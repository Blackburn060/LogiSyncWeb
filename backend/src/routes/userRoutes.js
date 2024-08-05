// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/usuarios', authMiddleware, userController.listarUsuarios);
router.get('/usuarios/:id', authMiddleware, userController.listarUsuario);
router.post('/usuarios', authMiddleware, userController.adicionarUsuario);
router.put('/usuarios/:id', authMiddleware, userController.atualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, userController.deletarUsuario);
router.get('/verificar-email', authMiddleware, userController.verificarEmailExistente); 

module.exports = router;
