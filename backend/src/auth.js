// src/auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'seu_segredo_super_secreto';

// Função para gerar o token JWT
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.Email, tipoUsuario: user.TipoUsuario }, SECRET_KEY, { expiresIn: '1h' });
};

// Função para hashear a senha
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Função para verificar a senha
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    generateToken,
    hashPassword,
    verifyPassword
};
