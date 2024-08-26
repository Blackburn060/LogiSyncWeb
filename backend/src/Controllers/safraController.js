const safraModel = require('../models/safraModel');

const listarSafras = async (req, res) => {
    try {
        const filters = req.query;
        const safras = await safraModel.getAllSafras(filters);
        res.json(safras);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar safras: " + error.message });
    }
};

const adicionarSafra = async (req, res) => {
    try {
        const safra = req.body;
        safra.CodigoUsuario = req.body.CodigoUsuario;
        const id = await safraModel.addSafra(safra);
        res.status(201).send({ id: id, message: "Safra adicionada com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar safra: " + error.message });
    }
};

const atualizarSafra = async (req, res) => {
    const safraId = req.params.id;
    const changes = req.body;

    try {
        changes.CodigoUsuario = req.body.CodigoUsuario;
        const updated = await safraModel.updateSafra(changes, safraId);
        if (updated) {
            res.send({ message: "Safra atualizada com sucesso." });
        } else {
            res.status(404).send({ message: "Safra não encontrada." });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar safra: " + error.message });
    }
};

const deletarSafra = async (req, res) => {
    try {
        const changes = await safraModel.deleteSafra(req.params.id);
        if (changes) {
            res.send({ message: "Safra deletada com sucesso" });
        } else {
            res.status(404).send({ message: "Safra não encontrada" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar safra: " + error.message });
    }
};

module.exports = {
    listarSafras,
    adicionarSafra,
    atualizarSafra,
    deletarSafra
};
