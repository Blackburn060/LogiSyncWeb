const horarioModel = require('../models/horarioModel');

const listarHorarios = async (req, res) => {
    try {
        const horarios = await horarioModel.getAllHorarios();
        res.json(horarios);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar horários: " + error.message });
    }
};

const adicionarHorario = async (req, res) => {
    try {
        const id = await horarioModel.addHorario(req.body);
        res.status(201).send({ id: id, message: "Horário adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar horário: " + error.message });
    }
};

const atualizarHorario = async (req, res) => {
    try {
        const changes = await horarioModel.updateHorario(req.body, req.params.id);
        if (changes) {
            res.send({ message: "Horário atualizado com sucesso" });
        } else {
            res.status(404).send({ message: "Horário não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar horário: " + error.message });
    }
};

const deletarHorario = async (req, res) => {
    try {
        const changes = await horarioModel.deleteHorario(req.params.id);
        if (changes) {
            res.send({ message: "Horário deletado com sucesso" });
        } else {
            res.status(404).send({ message: "Horário não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar horário: " + error.message });
    }
};

module.exports = {
    listarHorarios,
    adicionarHorario,
    atualizarHorario,
    deletarHorario
};
