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

// Função para buscar horários disponíveis em uma data específica
const getHorariosDisponiveisPorData = async (req, res) => {
    const { data } = req.query;
    if (!data) {
        return res.status(400).send({ message: 'A data é obrigatória.' });
    }

    try {
        const horariosDisponiveis = await HorarioModel.getHorariosDisponiveisPorData(data);
        res.json(horariosDisponiveis);
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        res.status(500).send({ message: 'Erro ao buscar horários disponíveis.' });
    }
};

// Função para atualizar o intervalo de horário
const updateHorario = async (req, res) => {
    const { id } = req.params;
    const { intervaloHorario } = req.body;

    if (intervaloHorario == null) {
        return res.status(400).send({ message: 'O intervalo de horário é obrigatório.' });
    }

    try {
        const result = await HorarioModel.updateIntervaloHorario(id, intervaloHorario);
        if (result.changes === 0) {
            return res.status(404).send({ message: 'Horário não encontrado.' });
        }
        res.send({ message: 'Intervalo de horário atualizado com sucesso.', details: result });
    } catch (err) {
        console.error('Erro ao atualizar intervalo de horário:', err);
        res.status(500).send({ message: 'Erro ao atualizar intervalo de horário.' });
    }
};

module.exports = {
    getHorarios,
    getHorariosDisponiveisPorData,
    updateHorario,
};
