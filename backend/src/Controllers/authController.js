const { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyPassword } = require('../auth');
const userModel = require('../models/userModel');

const login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user || !(await verifyPassword(senha, user.Senha))) {
            return res.status(401).send({ message: 'Credenciais inválidas' });
        }

        const accessToken = generateAccessToken({ id: user.CodigoUsuario, email: user.Email });
        const refreshToken = generateRefreshToken({ id: user.CodigoUsuario });

        res.send({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).send({ message: 'Erro no servidor' });
    }
};

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const decoded = verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken({ id: decoded.id });
        res.send({ accessToken });
    } catch (error) {
        res.status(401).send({ message: 'Token inválido' });
    }
};

module.exports = {
    login,
    refreshAccessToken
};
