const agendamentoModel = require('../models/agendamentoModel');

const listarAgendamentos = async (req, res) => {
    try {
        const agendamentos = await agendamentoModel.getAllAgendamentos();
        res.json(agendamentos);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar agendamentos: " + error.message });
    }
};

const adicionarAgendamento = async (req, res) => {
    try {
        const id = await agendamentoModel.addAgendamento(req.body);
        res.status(201).send({ id: id, message: "Agendamento adicionado com sucesso" });
    } catch (error) {
        res.status(500).send({ message: "Erro ao adicionar agendamento: " + error.message });
    }
};

const atualizarAgendamento = async (req, res) => {
    try {
        const changes = await agendamentoModel.updateAgendamento(req.body, req.params.id);
        if (changes) {
            res.send({ message: "Agendamento atualizado com sucesso" });
        } else {
            res.status(404).send({ message: "Agendamento não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao atualizar agendamento: " + error.message });
    }
};

const deletarAgendamento = async (req, res) => {
    try {
        const changes = await agendamentoModel.deleteAgendamento(req.params.id);
        if (changes) {
            res.send({ message: "Agendamento deletado com sucesso" });
        } else {
            res.status(404).send({ message: "Agendamento não encontrado" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar agendamento: " + error.message });
    }
};

module.exports = {
    listarAgendamentos,
    adicionarAgendamento,
    atualizarAgendamento,
    deletarAgendamento
};
