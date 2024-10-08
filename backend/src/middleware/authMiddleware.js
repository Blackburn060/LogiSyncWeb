const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../Config/jwtConfig');

function authMiddleware(req, res, next) {
    let token = null;

    // Verifica se o token está no cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]; // Extrai o token do cabeçalho
    }

    // Se não houver token no cabeçalho, verifica se está na query string
    if (!token && req.query.token) {
        token = req.query.token; // Apenas pega o token da query string sem adicionar 'Bearer'
    }

    // Verifica se o token está presente
    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    // Verifica e decodifica o token
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido ou expirado' });
        }

        // Armazena os dados do token decodificado no request (req.user)
        req.user = decoded;
        next();
    });
}

module.exports = authMiddleware;
