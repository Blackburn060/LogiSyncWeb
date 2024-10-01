const transportadoraModel = require('../models/transportadoraModel');
const AuthService = require('../services/authService');

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

        if (!req.body.Nome || !req.body.NomeFantasia || !req.body.CNPJ) {
            return res.status(400).send({ message: "Campos obrigatórios ausentes" });
        }

        const userId = req.user.id;  
        

        const novaTransportadora = await transportadoraModel.addTransportadora(req.body, userId);

        const updatedUser = {
            ...req.user,  
            CodigoTransportadora: novaTransportadora.CodigoTransportadora 
        };


        const newAccessToken = AuthService.generateToken(updatedUser);  

        return res.status(201).send({ 
            message: "Transportadora adicionada e usuário atualizado com sucesso", 
            token: newAccessToken,  
            transportadora: novaTransportadora
        });
    } catch (error) {
        console.error('Erro ao adicionar transportadora:', error);
        return res.status(500).send({ message: "Erro ao adicionar transportadora: " + error.message });
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
            if (transportadora.SituacaoTransportadora === 0) {
                return res.status(200).json({ message: "Transportadora está inativa." });
            }
            res.json(transportadora);
        } else {
            res.status(200).json({ message: "Nenhuma transportadora encontrada." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar transportadora: " + error.message });
    }
};

const adicionarTransportadoraPublic = async (req, res) => {
    try {
        const { nomeEmpresa, nomeFantasia, cnpj, userId } = req.body;

        // Validação de campos obrigatórios
        if (!nomeEmpresa || !nomeFantasia || !cnpj || !userId) {
            return res.status(400).send({ message: "Campos obrigatórios ausentes" });
        }

        // Adicionar a nova transportadora
        const novaTransportadora = await transportadoraModel.addTransportadora(req.body, userId);

        return res.status(201).send({
            message: "Transportadora adicionada com sucesso",
            transportadora: novaTransportadora
        });
    } catch (error) {
        console.error('Erro ao adicionar transportadora:', error);
        return res.status(500).send({ message: "Erro ao adicionar transportadora: " + error.message });
    }
};


module.exports = {
    listarTransportadoras,
    adicionarTransportadora,
    atualizarTransportadora,
    deletarTransportadora,
    getTransportadoraById,
    adicionarTransportadoraPublic
};
