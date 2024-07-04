const jwt = require('jsonwebtoken');
const SECRET_KEY = 'seu_segredo_super_secreto';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
