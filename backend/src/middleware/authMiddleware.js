// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const REACT_APP_SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, REACT_APP_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
