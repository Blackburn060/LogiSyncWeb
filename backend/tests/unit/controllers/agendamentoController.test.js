const agendamentoController = require('../../../src/Controllers/agendamentoController');
const agendamentoModel = require('../../../src/models/agendamentoModel');
const portariaController = require('../../../src/Controllers/portariaController');

// Mockar o agendamentoModel e portariaController
jest.mock('../../../src/models/agendamentoModel');
jest.mock('../../../src/Controllers/portariaController');

describe('Agendamento Controller', () => {
  
  describe('listarAgendamentos', () => {
    it('deve retornar uma lista de agendamentos com sucesso', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      const agendamentosMock = [{ id: 1, nome: 'Agendamento Teste' }];
      
      agendamentoModel.getAllAgendamentos.mockResolvedValue(agendamentosMock);

      await agendamentoController.listarAgendamentos(req, res);

      expect(agendamentoModel.getAllAgendamentos).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(agendamentosMock);
    });

    it('deve retornar um erro 500 ao falhar ao buscar agendamentos', async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro de banco de dados');

      agendamentoModel.getAllAgendamentos.mockRejectedValue(errorMock);

      await agendamentoController.listarAgendamentos(req, res);

      expect(agendamentoModel.getAllAgendamentos).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar agendamentos: ${errorMock.message}` });
    });
  });

  describe('aprovarAgendamento', () => {
    it('deve aprovar um agendamento e adicionar os dados da portaria com sucesso', async () => {
      const req = { params: { CodigoAgendamento: 1 }, body: { UsuarioAprovacao: 'admin', ObservacaoPortaria: 'Tudo certo' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
      agendamentoModel.updateStatusAgendamento.mockResolvedValue(true);
      portariaController.adicionarPortaria.mockResolvedValue();

      await agendamentoController.aprovarAgendamento(req, res);

      expect(agendamentoModel.updateStatusAgendamento).toHaveBeenCalledWith(1, 'Andamento');
      expect(portariaController.adicionarPortaria).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Agendamento aprovado e dados da portaria adicionados' });
    });

    it('deve retornar erro 404 se o agendamento não for encontrado', async () => {
      const req = { params: { CodigoAgendamento: 1 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      agendamentoModel.updateStatusAgendamento.mockResolvedValue(false);

      await agendamentoController.aprovarAgendamento(req, res);

      expect(agendamentoModel.updateStatusAgendamento).toHaveBeenCalledWith(1, 'Andamento');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Agendamento não encontrado' });
    });

    it('deve retornar erro 500 se ocorrer um erro no processo de aprovação', async () => {
      const req = { params: { CodigoAgendamento: 1 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const errorMock = new Error('Erro ao aprovar');

      agendamentoModel.updateStatusAgendamento.mockRejectedValue(errorMock);

      await agendamentoController.aprovarAgendamento(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao aprovar o agendamento', error: errorMock });
    });
  });

  describe('listarAgendamentosPorData', () => {
    it('deve listar agendamentos filtrados por data com sucesso', async () => {
      const req = { query: { DataAgendamento: '2023-10-01' } };
      const res = { json: jest.fn() };
      const agendamentosMock = [{ id: 1, data: '2023-10-01' }];

      agendamentoModel.getAgendamentosPorData.mockResolvedValue(agendamentosMock);

      await agendamentoController.listarAgendamentosPorData(req, res);

      expect(agendamentoModel.getAgendamentosPorData).toHaveBeenCalledWith('2023-10-01');
      expect(res.json).toHaveBeenCalledWith(agendamentosMock);
    });

    it('deve retornar erro 400 se a data não for fornecida', async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await agendamentoController.listarAgendamentosPorData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Data de agendamento é obrigatória' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar agendamentos por data', async () => {
      const req = { query: { DataAgendamento: '2023-10-01' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao buscar');

      agendamentoModel.getAgendamentosPorData.mockRejectedValue(errorMock);

      await agendamentoController.listarAgendamentosPorData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar agendamentos por data: ${errorMock.message}` });
    });
  });

  // Você pode criar outros testes similares para as demais funções do controller, como `recusarAgendamento`, `listarAgendamentosComPlaca`, etc.

});
