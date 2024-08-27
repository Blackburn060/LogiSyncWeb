const agendamentoModel = require('../models/agendamentoModel');

// Listar agendamentos por usuário
const listarAgendamentos = async (req, res) => {
    try {
        const filters = req.query;
        const agendamentos = await agendamentoModel.getAllAgendamentos(filters);
        res.json(agendamentos);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamentos: ' + error.message });
    }
};

// Listar agendamentos com placa do veículo
const listarAgendamentosComPlaca = async (req, res) => {
    try {
        const filters = req.query;
        const agendamentos = await agendamentoModel.getAllAgendamentosWithPlaca(filters);
        res.json(agendamentos);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamentos com placa: ' + error.message });
    }
};

// Adicionar agendamento
const adicionarAgendamento = async (req, res) => {
    try {
        const id = await agendamentoModel.addAgendamento(req.body);
        res.status(201).send({ id, message: 'Agendamento adicionado com sucesso' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao adicionar agendamento: ' + error.message });
    }
};

// Atualizar agendamento
const atualizarAgendamento = async (req, res) => {
    const agendamentoId = req.params.id;
    const changes = req.body;

    try {
        const updated = await agendamentoModel.updateAgendamento(changes, agendamentoId);
        if (updated) {
            res.send({ message: 'Agendamento atualizado com sucesso.' });
        } else {
            res.status(404).send({ message: 'Agendamento não encontrado.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar agendamento: ' + error.message });
    }
};

// Cancelar agendamento
const cancelarAgendamento = async (req, res) => {
    try {
        const changes = await agendamentoModel.cancelarAgendamento(req.params.id);
        if (changes) {
            res.send({ message: 'Agendamento cancelado com sucesso' });
        } else {
            res.status(404).send({ message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao cancelar agendamento: ' + error.message });
    }
};

// Deletar agendamento
const deletarAgendamento = async (req, res) => {
    try {
        const changes = await agendamentoModel.deleteAgendamento(req.params.id);
        if (changes) {
            res.send({ message: 'Agendamento deletado com sucesso' });
        } else {
            res.status(404).send({ message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao deletar agendamento: ' + error.message });
    }
};

// Registrar indisponibilidade
const registrarIndisponibilidadeHorario = async (req, res) => {
    try {
        const id = await agendamentoModel.registrarIndisponibilidade(req.body);
        res.status(201).send({ id, message: 'Horário registrado como indisponível com sucesso' });
    } catch (error) {
        res.status(500).send({ message: 'Erro ao registrar indisponibilidade: ' + error.message });
    }
};

// Listar indisponibilidades registradas
const listarIndisponibilidades = async (req, res) => {
    try {
        const indisponibilidades = await agendamentoModel.getIndisponibilidades();
        res.json(indisponibilidades);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar indisponibilidades: ' + error.message });
    }
};

// Deletar indisponibilidade
const deletarIndisponibilidade = async (req, res) => {
    try {
        const id = req.params.id;
        const changes = await agendamentoModel.deleteIndisponibilidade(id);
        if (changes) {
            res.send({ message: 'Indisponibilidade deletada com sucesso' });
        } else {
            res.status(404).send({ message: 'Indisponibilidade não encontrada' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao deletar indisponibilidade: ' + error.message });
    }
};

module.exports = {
    listarAgendamentos,
    listarAgendamentosComPlaca,
    adicionarAgendamento,
    atualizarAgendamento,
    cancelarAgendamento,
    deletarAgendamento,
    registrarIndisponibilidadeHorario,
    listarIndisponibilidades,
    deletarIndisponibilidade
};