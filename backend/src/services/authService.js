const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { jwtSecret, jwtExpiration, refreshSecret, refreshExpiration } = require('../Config/jwtConfig');

class AuthService {
    static async login(email, senha) {
        const user = await User.findUserByEmail(email.toLowerCase());
        if (!user) throw new Error('Usuário não encontrado');
        
        const senhaValida = await bcrypt.compare(senha, user.Senha);
        if (!senhaValida) throw new Error('Senha inválida');

        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { token, refreshToken };
    }

    static async registro(userData) {
        const { email, senha } = userData;
    
        // Verifica se o usuário já existe
        const existingUser = await User.findUserByEmail(email.toLowerCase());
        if (existingUser) throw new Error('Usuário já existe');
    
        // Garante que a senha foi passada e está correta
        if (!senha) throw new Error('A senha é obrigatória');
    
        // Gera o hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);
    
        // Adiciona o novo usuário ao banco de dados
        const user = await User.addUser({ ...userData, Senha: hashedPassword });
    
        // Gera os tokens de autenticação
        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);
    
        return { token, refreshToken };
    }

    // Gera o token JWT com as informações do usuário
    static generateToken(user) {
        const payload = {
            id: user.CodigoUsuario,
            email: user.Email,
            nomecompleto: user.NomeCompleto,
            tipousuario: user.TipoUsuario,
            codigotransportadora: user.CodigoTransportadora,
            cpf: user.CPF,
            numerocelular: user.NumeroCelular
        };

        return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration });
    }

    // Gera o refresh token
    static generateRefreshToken(user) {
        const payload = {
            id: user.CodigoUsuario,
            email: user.Email,
        };

        return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiration });
    }

    static verifyToken(token) {
        return jwt.verify(token, jwtSecret);
    }

    static verifyRefreshToken(token) {
        return jwt.verify(token, refreshSecret);
    }
}

module.exports = AuthService;
