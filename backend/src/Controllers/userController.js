const userModel = require('../models/userModel');
const { hashPassword, verifyPassword } = require('../auth');

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

// Adicionar um usuário
const adicionarUsuario = async (req, res) => {
    const { nomeCompleto, email, senha, tipoUsuario, codigoTransportadora, numeroCelular } = req.body;

    try {
        const hashedPassword = await hashPassword(senha);
        const user = {
            NomeCompleto: nomeCompleto,
            Email: email,
            Senha: hashedPassword,
            TipoUsuario: tipoUsuario,
            CodigoTransportadora: codigoTransportadora || null,
            SituacaoUsuario: 1,
            NumeroCelular: numeroCelular || null
        };

        const userId = await userModel.addUser(user);
        res.status(201).send({ id: userId, message: "Usuário adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar usuário: " + error.message });
    }
};

// Atualizar um usuário
const atualizarUsuario = async (req, res) => {
    const userId = req.params.id;
    const changes = req.body;

    // Verifique se a senha está sendo atualizada e hashe-a se necessário
    if (changes.senha) {
        try {
            changes.Senha = await hashPassword(changes.senha);
            delete changes.senha; // Remova a chave `senha` para evitar duplicação
        } catch (error) {
            return res.status(500).send({ message: "Erro ao hashear senha: " + error.message });
        }
    }

    try {
        const updated = await userModel.updateUser(changes, userId);
        if (updated) {
            res.send({ message: "Usuário atualizado com sucesso." });
        } else {
            res.status(404).send({ message: "Usuário não encontrado." });
        }
    } catch (error) {
        console.error("Erro na atualização:", error);
        res.status(500).send({ message: "Erro ao atualizar usuário: " + error.message });
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
    atualizarUsuario,
    deletarUsuario
};
