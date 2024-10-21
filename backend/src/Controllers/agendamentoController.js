const agendamentoModel = require('../models/agendamentoModel');
const portariaController = require('../Controllers/portariaController');

let clients = [];

// Função para evento SSE
const eventoSSE = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
};

// Função para enviar atualizações para todos os clientes conectados via SSE
const enviarAtualizacaoSSE = (data) => {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};

// Função que atualiza o status de um agendamento e envia evento SSE
const atualizarStatusAgendamentoEEnviarEvento = async (CodigoAgendamento, novoStatus) => {
    const atualizado = await agendamentoModel.updateStatusAgendamento(CodigoAgendamento, novoStatus);
    if (atualizado) {
        enviarAtualizacaoSSE({ CodigoAgendamento, novoStatus });
    }
};

// Listar agendamentos por usuário
const listarAgendamentos = async (req, res) => {
    try {
        const filters = req.query;
        const agendamentos = await agendamentoModel.getAllAgendamentos(filters);

        // Filtrar agendamentos "Indisponível"
        const agendamentosFiltrados = agendamentos.filter(
            (agendamento) => agendamento.SituacaoAgendamento !== "Indisponível"
        );

        if (agendamentosFiltrados.length === 0) {
            return res.status(204).send();
        }

        res.json(agendamentosFiltrados);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamentos: ' + error.message });
    }
};


// Listar agendamentos por data
const listarAgendamentosPorData = async (req, res) => {
    try {
        const { DataAgendamento } = req.query;
        if (!DataAgendamento) {
            return res.status(400).send({ message: 'Data de agendamento é obrigatória' });
        }

        const agendamentos = await agendamentoModel.getAgendamentosPorData(DataAgendamento);

        if (agendamentos.length === 0) {
            return res.status(204).send();
        }

        res.json(agendamentos);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamentos por data: ' + error.message });
    }
};
// Listar agendamentos por status
const listarAgendamentosPorStatus = async (req, res) => {
    try {
        const agendamentos = await agendamentoModel.getAgendamentosPorStatus();

        if (agendamentos.length === 0) {
            return res.status(204).send();
        }

        res.json(agendamentos);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamentos: ' + error.message });
    }
};
const listarAgendamentosAdmin = async (req, res) => {
    try {
      // Chama a função do model que retorna os agendamentos administrativos
      const agendamentos = await agendamentoModel.listarAgendamentosAdmin();
      // Retorna os dados como resposta
      return res.status(200).json(agendamentos);
    } catch (error) {
      // Lida com erros e retorna uma resposta com erro 500
      return res.status(500).json({ error: 'Erro ao buscar agendamentos administrativos.' });
    }
  };
  
// Aprovar agendamento
const aprovarAgendamento = async (req, res) => {
    try {
        const { CodigoAgendamento } = req.params;
        const { UsuarioAprovacao, ObservacaoPortaria } = req.body;

        const aprovado = await agendamentoModel.updateStatusAgendamento(CodigoAgendamento, 'Andamento');

        if (aprovado) {
            const portariaData = {
                CodigoAgendamento,
                DataHoraEntrada: new Date().toISOString(),
                UsuarioAprovacao,
                ObservacaoPortaria
            };

            await portariaController.adicionarPortaria({ body: portariaData }, res);

            // Enviar evento SSE para todos os clientes conectados
            enviarAtualizacaoSSE({ CodigoAgendamento, novoStatus: 'Andamento' });

            res.status(200).json({ message: 'Agendamento aprovado e dados da portaria adicionados' });
        } else {
            res.status(404).json({ message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao aprovar o agendamento', error });
    }
};

// Recusar agendamento
const recusarAgendamento = async (req, res) => {
    try {
        const { CodigoAgendamento } = req.params;
        const { UsuarioAprovacao, MotivoRecusa } = req.body;

        const recusado = await agendamentoModel.updateStatusAgendamento(CodigoAgendamento, 'Recusado');

        if (recusado) {
            const portariaData = {
                CodigoAgendamento,
                MotivoRecusa,
                UsuarioAprovacao
            };

            await portariaController.adicionarPortaria({ body: portariaData }, res);

            // Enviar evento SSE para todos os clientes conectados
            enviarAtualizacaoSSE({ CodigoAgendamento, novoStatus: 'Recusado' });

            res.status(200).json({ message: 'Agendamento recusado e dados da portaria adicionados' });
        } else {
            res.status(404).json({ message: 'Agendamento não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao recusar o agendamento', error });
    }
};

// Listar agendamentos com placa
const listarAgendamentosComPlaca = async (req, res) => {
    try {
        const { CodigoUsuario, limit = 10, offset = 0 } = req.query;
        const agendamentos = await agendamentoModel.getAllAgendamentosWithPlaca({ CodigoUsuario, limit, offset });

        if (agendamentos.length === 0) {
            return res.status(204).send();
        }

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

        // Enviar evento SSE
        enviarAtualizacaoSSE({ id, novoStatus: 'Novo agendamento' });
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

            // Enviar evento SSE
            enviarAtualizacaoSSE({ agendamentoId, novoStatus: 'Atualizado' });
        } else {
            res.status(404).send({ message: 'Agendamento não encontrado.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar agendamento: ' + error.message });
    }
};

// Buscar agendamento por ID
const buscarAgendamentoPorId = async (req, res) => {
    const agendamentoId = req.params.id;

    try {
        const agendamento = await agendamentoModel.getAgendamentoById(agendamentoId);
        if (agendamento) {
            res.json(agendamento);
        } else {
            res.status(404).send({ message: 'Agendamento não encontrado.' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar agendamento: ' + error.message });
    }
};

// Cancelar agendamento
const cancelarAgendamento = async (req, res) => {
    try {
        const changes = await agendamentoModel.cancelarAgendamento(req.params.id);
        if (changes) {
            res.send({ message: 'Agendamento cancelado com sucesso' });

            // Enviar evento SSE
            enviarAtualizacaoSSE({ id: req.params.id, novoStatus: 'Cancelado' });
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

            // Enviar evento SSE
            enviarAtualizacaoSSE({ id: req.params.id, novoStatus: 'Deletado' });
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


// Listar indisponibilidades
const listarIndisponibilidades = async (req, res) => {
    try {
        const indisponibilidades = await agendamentoModel.getIndisponibilidades();

        if (indisponibilidades.length === 0) {
            return res.status(204).send();
        }

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

const listarAgendamentosGestaoPatio = async (req, res) => {
    try {
        const { data, status } = req.query;

        if (!data) {
            return res.status(400).json({ message: "Data do agendamento é necessária." });
        }

        const agendamentos = await agendamentoModel.getAgendamentosPorStatusEData(data, status);

        if (agendamentos.length === 0) {
            return res.status(204).send(); // Sem conteúdo, mas requisição bem-sucedida
        }

        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar agendamentos.", error });
    }
};
;

module.exports = {
    listarAgendamentos,
    recusarAgendamento,
    listarAgendamentosComPlaca,
    aprovarAgendamento,
    listarAgendamentosGestaoPatio,
    adicionarAgendamento,
    buscarAgendamentoPorId,
    atualizarAgendamento,
    cancelarAgendamento,
    listarAgendamentosAdmin,
    deletarAgendamento,
    listarAgendamentosPorStatus,
    listarAgendamentosPorData,
    registrarIndisponibilidadeHorario,
    listarIndisponibilidades,
    deletarIndisponibilidade,
    eventoSSE // Endpoint para Server-Sent Events
};
