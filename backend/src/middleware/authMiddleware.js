const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../Config/jwtConfig');

function authMiddleware(req, res, next) {
    // Verifica se o header contém o token (no formato "Bearer <token>")
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Token não fornecido ou malformado' });
    }

    // Extrai o token (remove "Bearer " da string)
    const token = authHeader.split(' ')[1];

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
