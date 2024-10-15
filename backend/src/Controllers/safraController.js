const safraModel = require('../models/safraModel');

const listarSafras = async (req, res) => {
    try {
        const filters = req.query;
        const safras = await safraModel.getAllSafras(filters);

        // Verifica se há safras; caso contrário, retorna 204
        if (safras.length === 0) {
            return res.status(204).send(); // Sem conteúdo, mas a requisição foi bem-sucedida
        }

        res.json(safras);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar safras: " + error.message });
    }
};

const adicionarSafra = async (req, res) => {
    try {
        const safra = {
            AnoSafra: req.body.AnoSafra,
            SituacaoSafra: req.body.SituacaoSafra,
            UsuarioAlteracao: req.body.CodigoUsuario  // Usar Código do Usuário apenas aqui
        };
        
        const id = await safraModel.addSafra(safra);
        res.status(201).send({ id: id, message: "Safra adicionada com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar safra: " + error.message });
    }
};


const getSafraById = async (req, res) => {
    const { id } = req.params;
    try {
        const safra = await safraModel.getSafraById(id);

        if (safra) {
            res.json(safra);
        } else {
            res.status(404).json({ message: "Safra não encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar safra", error });
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
    getSafraById,
    atualizarSafra,
    deletarSafra
};
