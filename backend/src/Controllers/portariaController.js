const portariaModel = require('../models/portariaModel');

const listarPortarias = async (req, res) => {
    try {
        const portarias = await portariaModel.getAllPortarias();
        res.json(portarias);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar dados da portaria: " + error.message });
    }
};
const buscarPortariaPorAgendamento = async (req, res) => {
    try {
        const portaria = await portariaModel.getPortariaByCodigoAgendamento(req.params.CodigoAgendamento);
        if (portaria) {
            res.json(portaria);
        } else {
            res.status(404).send({ message: "Dados da portaria não encontrados" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar dados da portaria: " + error.message });
    }
};
const adicionarPortaria = async (req, res) => {
    try {
      const id = await portariaModel.addPortaria(req.body);
      res.status(201).send({ id: id, message: "Dados da portaria adicionados com sucesso" });
    } catch (error) {
      res.status(500).send({ message: "Erro ao adicionar dados da portaria: " + error.message });
    }
  };
  
  const atualizarPortaria = async (req, res) => {
    try {
      const { id } = req.params;  // ID do agendamento
      const { DataHoraSaida, MotivoRecusa } = req.body;  // Recebendo DataHoraSaida e MotivoRecusa no corpo da requisição
  
      // Verifica se o ID foi fornecido
      if (!id) {
        return res.status(400).json({ error: "ID não fornecido." });
      }
  
      // Atualiza os campos de DataHoraSaida e MotivoRecusa no banco de dados
      const result = await portariaModel.updatePortaria(id, { DataHoraSaida, MotivoRecusa });
  
      if (result > 0) {
        res.json({ message: "Portaria atualizada com sucesso", data: result });
      } else {
        res.status(404).json({ message: "Portaria não encontrada" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar portaria", error: error.message });
    }
  };
  

const deletarPortaria = async (req, res) => {
    try {
        const changes = await portariaModel.deletePortaria(req.params.id);
        if (changes) {
            res.send({ message: "Dados da portaria deletados com sucesso" });
        } else {
            res.status(404).send({ message: "Dados da portaria não encontrados" });
        }
    } catch (error) {
        res.status(500).send({ message: "Erro ao deletar dados da portaria: " + error.message });
    }
};

module.exports = {
    buscarPortariaPorAgendamento,
    listarPortarias,
    adicionarPortaria,
    atualizarPortaria,
    deletarPortaria
};
