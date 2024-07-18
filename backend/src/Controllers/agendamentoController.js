const agendamentoModel = require('../models/agendamentoModel');

// Listar agendamentos por usuário
const listarAgendamentos = async (req, res) => {
    try {
        const userId = req.user.id;  // ID do usuário logado
        const filters = { ...req.query, CodigoUsuario: userId };  // Adiciona o filtro de usuario logado

        console.log("Filtros recebidos:", filters);
        const agendamentos = await agendamentoModel.getAllAgendamentos(filters);
        console.log("Agendamentos encontrados:", agendamentos);
        res.json(agendamentos);
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        res.status(500).send({ message: "Erro ao buscar agendamentos: " + error.message });
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

module.exports = {
    listarAgendamentos,
    adicionarAgendamento,
    atualizarAgendamento,
    deletarAgendamento
};
