const userModel = require('../models/userModel');

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await userModel.getAllUsers();
        res.json(usuarios);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar usuários: " + error.message });
    }
};

// Adicionar um usuário
const adicionarUsuario = async (req, res) => {
    try {
        const id = await userModel.addUser(req.body);
        res.status(201).send({ id: id, message: "Usuário adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar usuário: " + error.message });
    }
};

// Atualizar um usuário
const atualizarUsuario = async (req, res) => {
    const userId = req.params.id;
    const changes = req.body;

    console.log("Recebendo para atualizar:", changes); // Verifique os dados recebidos

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
