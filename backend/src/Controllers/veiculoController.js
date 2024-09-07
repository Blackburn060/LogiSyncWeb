const veiculoModel = require('../models/veiculoModel');

const listarVeiculos = async (req, res) => {
    try {
        const userId = req.user.id; 
        const veiculos = await veiculoModel.getAllVeiculos({ CodigoUsuario: userId });
        res.json(veiculos);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar veículos: " + error.message });
    }
};
const obterVeiculoPorId = async (req, res) => {
    const veiculoId = req.params.id; // Pega o ID do veículo da URL
    try {
        const veiculos = await veiculoModel.getAllVeiculos({ CodigoVeiculo: veiculoId });
        if (veiculos.length > 0) {
            res.status(200).json(veiculos[0]); // Retorna o primeiro veículo encontrado
        } else {
            res.status(404).json({ message: "Veículo não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar veículo: " + error.message });
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
    const veiculoId = req.params.id;
    const changes = req.body;

    try {
        const updated = await veiculoModel.updateVeiculo(changes, veiculoId);
        if (updated) {
            res.send({ message: "Veículo atualizado com sucesso." });
        } else {
            res.status(404).send({ message: "Veículo não encontrado." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar veículo: " + error.message });
    }
};

const deletarVeiculo = async (req, res) => {
    try {
        const changes = await veiculoModel.deleteVeiculo(req.params.id);
        if (changes) {
            res.send({ message: "Veículo inativado com sucesso" });
        } else {
            res.status(404).send({ message: "Veículo não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao inativar veículo: " + error.message });
    }
};

module.exports = {
    listarVeiculos,
    adicionarVeiculo,
    obterVeiculoPorId,
    atualizarVeiculo,
    deletarVeiculo
};
