const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = 'seu_segredo_super_secreto'; //Colocar em uma variavel de ambiente, esquece n kayky

const generateToken = (user) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
};

const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    generateToken,
    hashPassword,
    verifyPassword
};
