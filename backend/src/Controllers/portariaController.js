const portariaModel = require('../models/portariaModel');

const listarPortarias = async (req, res) => {
    try {
        const portarias = await portariaModel.getAllPortarias();
        res.json(portarias);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar dados da portaria: " + error.message });
    }
};

const adicionarPortaria = async (req, res) => {
    try {
        const id = await portariaModel.addPortaria(req.body);
        res.status(201).send({ id: id, message: "Dados da portaria adicionados com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar dados da portaria: " + error.message });
    }
};

const atualizarPortaria = async (req, res) => {
    try {
        const changes = await portariaModel.updatePortaria(req.body, req.params.id);
        if (changes) {
            res.send({ message: "Dados da portaria atualizados com sucesso" });
        } else {
            res.status(404).send({ message: "Dados da portaria não encontrados" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar dados da portaria: " + error.message });
    }
};

const deletarPortaria = async (req, res) => {
    try {
        const changes = await portariaModel.deletePortaria(req.params.id);
        if (changes) {
            res.send({ message: "Dados da portaria deletados com sucesso" });
        } else {
            res.status(404).send({ message: "Dados da portaria não encontrados" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar dados da portaria: " + error.message });
    }
};

module.exports = {
    listarPortarias,
    adicionarPortaria,
    atualizarPortaria,
    deletarPortaria
};
