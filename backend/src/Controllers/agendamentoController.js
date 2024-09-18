const agendamentoModel = require('../models/agendamentoModel');
const portariaController = require('../Controllers/portariaController');

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
const listarAgendamentosPorData = async (req, res) => {
    try {
      const { DataAgendamento } = req.query;
      if (!DataAgendamento) {
        return res.status(400).send({ message: 'Data de agendamento é obrigatória' });
      }
  
      const agendamentos = await agendamentoModel.getAgendamentosPorData(DataAgendamento);
      res.json(agendamentos);
    } catch (error) {
      res.status(500).send({ message: 'Erro ao buscar agendamentos por data: ' + error.message });
    }
  };
  // Listar agendamentos aprovados
// Listar agendamentos com status "Aprovado", "Andamento" ou "Finalizado"
const listarAgendamentosPorStatus = async (req, res) => {
    try {
        const agendamentos = await agendamentoModel.getAgendamentosPorStatus();  // Chama o model que retorna os agendamentos com os três status
        res.json(agendamentos);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamentos: ' + error.message });
    }
};
const aprovarAgendamento = async (req, res) => {
    try {
        const { CodigoAgendamento } = req.params;
        const { UsuarioAprovacao, ObservacaoPortaria } = req.body;
        
        // Aprovar o agendamento - Atualizar status para "Andamento"
        const aprovado = await agendamentoModel.updateStatusAgendamento(CodigoAgendamento, 'Andamento');
        
        if (aprovado) {
            // Adicionar dados na portaria
            const portariaData = {
                CodigoAgendamento,
                DataHoraEntrada: new Date().toISOString(), // Adiciona a data/hora de entrada
                UsuarioAprovacao,
                ObservacaoPortaria
            };

            await portariaController.adicionarPortaria({ body: portariaData }, res);  // Chama a função do controller de portaria para adicionar os dados

            res.status(200).json({ message: 'Agendamento aprovado e dados da portaria adicionados' });
        } else {
            res.status(404).json({ message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao aprovar o agendamento', error });
    }
};
const recusarAgendamento = async (req, res) => {
    try {
        const { CodigoAgendamento } = req.params;
        const { UsuarioAprovacao, MotivoRecusa } = req.body;

        // Atualiza o status do agendamento para "Recusado"
        const recusado = await agendamentoModel.updateStatusAgendamento(CodigoAgendamento, 'Recusado');

        if (recusado) {
            // Atualiza ou insere os dados da portaria com o motivo da recusa
            const portariaData = {
                CodigoAgendamento,
                MotivoRecusa,
                UsuarioAprovacao
            };

            await portariaController.adicionarPortaria({ body: portariaData }, res);  // Chama a função para inserir os dados da portaria

            res.status(200).json({ message: 'Agendamento recusado e dados da portaria adicionados' });
        } else {
            res.status(404).json({ message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao recusar o agendamento', error });
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
    recusarAgendamento,
    listarAgendamentosComPlaca,
    aprovarAgendamento,
    adicionarAgendamento,
    atualizarAgendamento,
    cancelarAgendamento,
    deletarAgendamento,
    listarAgendamentosPorStatus,
    listarAgendamentosPorData,
    registrarIndisponibilidadeHorario,
    listarIndisponibilidades,
    deletarIndisponibilidade
};