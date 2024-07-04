const { generateToken, verifyPassword } = require('../auth');
const userModel = require('../models/userModel');

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user || !(await verifyPassword(senha, user.Senha))) {
            return res.status(401).send({ message: 'Credenciais inválidas' });
        }

        const token = generateToken({ id: user.CodigoUsuario, email: user.Email });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ message: 'Erro no servidor' });
    }
};

module.exports = {
    login
};
