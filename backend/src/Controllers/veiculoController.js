const veiculoModel = require('../models/veiculoModel');

const listarVeiculos = async (req, res) => {
    try {
        const veiculos = await veiculoModel.getAllVeiculos();
        res.json(veiculos);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar veículos: " + error.message });
    }
};

const adicionarVeiculo = async (req, res) => {
    try {
        const id = await veiculoModel.addVeiculo(req.body);
        res.status(201).send({ id: id, message: "Veículo adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar veículo: " + error.message });
    }
};

const atualizarVeiculo = async (req, res) => {
    try {
        const changes = await veiculoModel.updateVeiculo(req.body, req.params.id);
        if (changes) {
            res.send({ message: "Veículo atualizado com sucesso" });
        } else {
            res.status(404).send({ message: "Veículo não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar veículo: " + error.message });
    }
};

const deletarVeiculo = async (req, res) => {
    try {
        const changes = await veiculoModel.deleteVeiculo(req.params.id);
        if (changes) {
            res.send({ message: "Veículo deletado com sucesso" });
        } else {
            res.status(404).send({ message: "Veículo não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar veículo: " + error.message });
    }
};

module.exports = {
    listarVeiculos,
    adicionarVeiculo,
    atualizarVeiculo,
    deletarVeiculo
};
