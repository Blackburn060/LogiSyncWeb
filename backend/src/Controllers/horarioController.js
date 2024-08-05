const HorarioModel = require('../models/horarioModel');

// Função para obter todos os horários
const getHorarios = async (req, res) => {
    try {
        const horarios = await HorarioModel.getHorarios();
        res.json(horarios);
    } catch (err) {
        console.error('Erro ao buscar horários:', err);
        res.status(500).send({ message: 'Erro ao buscar horários.' });
    }
};

// Função para atualizar a disponibilidade de um horário
const updateHorario = async (req, res) => {
    const { id } = req.params;
    const { day, status } = req.body;

    // Validação de entrada para 'day' e 'status'
    const validDays = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    const validStatuses = ['disponível', 'indisponível', 'pendente'];

    if (!day || !status) {
        console.error("Faltam dados: dia ou status.");
        return res.status(400).send({ message: "Faltam dados: dia ou status." });
    }

    if (!validDays.includes(day) || !validStatuses.includes(status)) {
        console.error("Dados inválidos fornecidos para dia ou status.");
        return res.status(400).send({ message: "Dados inválidos fornecidos para dia ou status." });
    }

    try {
        const result = await HorarioModel.updateDayStatus(id, day, status);
        if (result.changes === 0) {
            console.error("Horário não encontrado.");
            return res.status(404).send({ message: 'Horário não encontrado.' });
        }
        res.send({ message: 'Disponibilidade atualizada com sucesso.', details: result });
    } catch (err) {
        console.error('Erro ao atualizar horário:', err);
        res.status(500).send({ message: 'Erro ao atualizar disponibilidade.' });
    }
};

module.exports = {
    getHorarios,
    updateHorario
};
