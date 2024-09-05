const userModel = require('../models/userModel');
const { hashPassword } = require('../auth');

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
    try {
        const filters = req.query;
        const usuarios = await userModel.getAllUsers(filters);
        res.json(usuarios);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar usuários: " + error.message });
    }
};

// Listar um usuário pelo ID
const listarUsuario = async (req, res) => {
    try {
        const usuario = await userModel.getUserById(req.params.id);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).send({ message: "Usuário não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar usuário: " + error.message });
    }
};

// Adicionar um usuário
const adicionarUsuario = async (req, res) => {
    const { nomeCompleto, email, senha, tipoUsuario, codigoTransportadora, numeroCelular, cpf } = req.body;

    try {
        const hashedPassword = await hashPassword(senha);
        const user = {
            NomeCompleto: nomeCompleto,
            Email: email,
            Senha: hashedPassword,
            TipoUsuario: tipoUsuario,
            CodigoTransportadora: codigoTransportadora || null,
            SituacaoUsuario: 1,
            NumeroCelular: numeroCelular || null,
            CPF: cpf || null
        };

        const userId = await userModel.addUser(user);
        res.status(201).send({ id: userId, message: "Usuário adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar usuário: " + error.message });
    }
};

// Atualizar um usuário
const atualizarUsuario = async (req, res) => {
    const user = req.body;

    // Verifique se há campos para atualizar
    if (Object.keys(user).length === 0) {
        return res.status(400).send({ message: 'Nenhum dado para atualizar' });
    }

    try {
        const changes = await userModel.updateUser(user, req.params.id);
        if (changes > 0) {
            res.send({ message: "Usuário atualizado com sucesso" });
        } else {
            res.status(400).send({ message: "Nenhuma alteração foi realizada" });
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).send({ message: "Erro ao atualizar usuário: " + error.message });
    }
};



// Verificar se o e-mail já existe
const verificarEmailExistente = async (req, res) => {
    const { email } = req.query;
    try {
        const user = await userModel.findUserByEmail(email);
        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao verificar e-mail: " + error.message });
    }
};

// Deletar um usuário
const deletarUsuario = async (req, res) => {
    try {
        const changes = await userModel.deleteUser(req.params.id);
        if (changes) {
            res.send({ message: "Usuário deletado com sucesso" });
        } else {
            res.status(404).send({ message: "Usuário não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar usuário: " + error.message });
    }
};

module.exports = {
    listarUsuarios,
    adicionarUsuario,
    listarUsuario, 
    verificarEmailExistente,
    atualizarUsuario,
    deletarUsuario
};
