const portariaController = require('../../../src/Controllers/portariaController');
const portariaModel = require('../../../src/models/portariaModel');

// Mock do portariaModel
jest.mock('../../../src/models/portariaModel');

describe('PortariaController', () => {
  // Teste para a função listarPortarias
  describe('listarPortarias', () => {
    it('deve retornar todos os dados de portarias com sucesso', async () => {
      const req = {};
      const res = { json: jest.fn() };
      const portariasMock = [{ id: 1, CodigoAgendamento: 123, DataHoraEntrada: '2023-10-01 08:00:00' }];
      
      portariaModel.getAllPortarias.mockResolvedValue(portariasMock);

      await portariaController.listarPortarias(req, res);

      expect(portariaModel.getAllPortarias).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(portariasMock);
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar portarias', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao buscar portarias');

      portariaModel.getAllPortarias.mockRejectedValue(errorMock);

      await portariaController.listarPortarias(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar dados da portaria: ${errorMock.message}` });
    });
  });

  // Teste para a função buscarPortariaPorAgendamento
  describe('buscarPortariaPorAgendamento', () => {
    it('deve retornar os dados da portaria para um agendamento específico', async () => {
      const req = { params: { CodigoAgendamento: 123 } };
      const res = { json: jest.fn() };
      const portariaMock = { id: 1, CodigoAgendamento: 123, DataHoraEntrada: '2023-10-01 08:00:00' };
      
      portariaModel.getPortariaByCodigoAgendamento.mockResolvedValue(portariaMock);

      await portariaController.buscarPortariaPorAgendamento(req, res);

      expect(portariaModel.getPortariaByCodigoAgendamento).toHaveBeenCalledWith(123);
      expect(res.json).toHaveBeenCalledWith(portariaMock);
    });

    it('deve retornar erro 404 se os dados da portaria não forem encontrados', async () => {
      const req = { params: { CodigoAgendamento: 123 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      portariaModel.getPortariaByCodigoAgendamento.mockResolvedValue(null);

      await portariaController.buscarPortariaPorAgendamento(req, res);

      expect(portariaModel.getPortariaByCodigoAgendamento).toHaveBeenCalledWith(123);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Dados da portaria não encontrados' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar os dados da portaria', async () => {
      const req = { params: { CodigoAgendamento: 123 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao buscar portaria');

      portariaModel.getPortariaByCodigoAgendamento.mockRejectedValue(errorMock);

      await portariaController.buscarPortariaPorAgendamento(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar dados da portaria: ${errorMock.message}` });
    });
  });

  // Teste para a função adicionarPortaria
  describe('adicionarPortaria', () => {
    it('deve adicionar uma nova portaria e retornar o ID gerado', async () => {
      const req = { body: { CodigoAgendamento: 123, DataHoraEntrada: '2023-10-01 08:00:00' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const idMock = 1;

      portariaModel.addPortaria.mockResolvedValue(idMock);

      await portariaController.adicionarPortaria(req, res);

      expect(portariaModel.addPortaria).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ id: idMock, message: 'Dados da portaria adicionados com sucesso' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao adicionar uma portaria', async () => {
      const req = { body: { CodigoAgendamento: 123, DataHoraEntrada: '2023-10-01 08:00:00' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao adicionar portaria');

      portariaModel.addPortaria.mockRejectedValue(errorMock);

      await portariaController.adicionarPortaria(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao adicionar dados da portaria: ${errorMock.message}` });
    });
  });

  // Teste para a função atualizarPortaria
  describe('atualizarPortaria', () => {
    it('deve atualizar uma portaria com sucesso', async () => {
      const req = { params: { id: 1 }, body: { DataHoraSaida: '2023-10-01 17:00:00', MotivoRecusa: null } };
      const res = { json: jest.fn() };
      const resultMock = 1;

      portariaModel.updatePortaria.mockResolvedValue(resultMock);

      await portariaController.atualizarPortaria(req, res);

      expect(portariaModel.updatePortaria).toHaveBeenCalledWith(1, { DataHoraSaida: '2023-10-01 17:00:00', MotivoRecusa: null });
      expect(res.json).toHaveBeenCalledWith({ message: 'Portaria atualizada com sucesso', data: resultMock });
    });

    it('deve retornar erro 404 se a portaria não for encontrada', async () => {
      const req = { params: { id: 1 }, body: { DataHoraSaida: '2023-10-01 17:00:00', MotivoRecusa: null } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const resultMock = 0;

      portariaModel.updatePortaria.mockResolvedValue(resultMock);

      await portariaController.atualizarPortaria(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Portaria não encontrada' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao atualizar a portaria', async () => {
      const req = { params: { id: 1 }, body: { DataHoraSaida: '2023-10-01 17:00:00', MotivoRecusa: null } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const errorMock = new Error('Erro ao atualizar portaria');

      portariaModel.updatePortaria.mockRejectedValue(errorMock);

      await portariaController.atualizarPortaria(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao atualizar portaria', error: errorMock.message });
    });
  });

  // Teste para a função deletarPortaria
  describe('deletarPortaria', () => {
    it('deve deletar uma portaria com sucesso', async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      portariaModel.deletePortaria.mockResolvedValue(changesMock);

      await portariaController.deletarPortaria(req, res);

      expect(portariaModel.deletePortaria).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({ message: 'Dados da portaria deletados com sucesso' });
    });

    it('deve retornar erro 404 se os dados da portaria não forem encontrados', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      portariaModel.deletePortaria.mockResolvedValue(changesMock);

      await portariaController.deletarPortaria(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Dados da portaria não encontrados' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao deletar os dados da portaria', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao deletar portaria');

      portariaModel.deletePortaria.mockRejectedValue(errorMock);

      await portariaController.deletarPortaria(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao deletar dados da portaria: ${errorMock.message}` });
    });
  });
});
