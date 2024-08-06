const transportadoraModel = require('../models/transportadoraModel');

const listarTransportadoras = async (req, res) => {
    try {
        const filters = req.query; 
        const transportadoras = await transportadoraModel.getAllTransportadoras(filters);
        res.json(transportadoras);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar transportadoras: " + error.message });
    }
};

const adicionarTransportadora = async (req, res) => {
    try {
        const id = await transportadoraModel.addTransportadora(req.body);
        res.status(201).send({ id: id, message: "Transportadora adicionada com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar transportadora: " + error.message });
    }
};

const atualizarTransportadora = async (req, res) => {
    try {
        const changes = await transportadoraModel.updateTransportadora(req.body, req.params.id);
        if (changes) {
            res.send({ message: "Transportadora atualizada com sucesso" });
        } else {
            res.status(404).send({ message: "Transportadora não encontrada" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar transportadora: " + error.message });
    }
};

const deletarTransportadora = async (req, res) => {
    try {
        const changes = await transportadoraModel.deleteTransportadora(req.params.id);
        if (changes) {
            res.send({ message: "Transportadora inativada com sucesso" });
        } else {
            res.status(404).send({ message: "Transportadora não encontrada" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao inativar transportadora: " + error.message });
    }
};

const getTransportadoraById = async (req, res) => {
    try {
        const transportadora = await transportadoraModel.getTransportadoraById(req.params.id);
        if (transportadora) {
            res.json(transportadora);
        } else {
            res.status(404).send({ message: "Transportadora não encontrada" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar transportadora: " + error.message });
    }
};

module.exports = {
    listarTransportadoras,
    adicionarTransportadora,
    atualizarTransportadora,
    deletarTransportadora,
    getTransportadoraById
};
