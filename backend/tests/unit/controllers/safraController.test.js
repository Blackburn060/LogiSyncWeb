const safraController = require('../../../src/Controllers/safraController');
const safraModel = require('../../../src/models/safraModel');

// Mock do safraModel
jest.mock('../../../src/models/safraModel');

describe('SafraController', () => {

  // Teste para a função listarSafras
  describe('listarSafras', () => {
    it('deve retornar uma lista de safras com sucesso', async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      const safrasMock = [{ id: 1, nome: 'Safra 1' }, { id: 2, nome: 'Safra 2' }];
      
      safraModel.getAllSafras.mockResolvedValue(safrasMock);

      await safraController.listarSafras(req, res);

      expect(safraModel.getAllSafras).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(safrasMock);
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar safras', async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao buscar safras');

      safraModel.getAllSafras.mockRejectedValue(errorMock);

      await safraController.listarSafras(req, res);

      expect(safraModel.getAllSafras).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao buscar safras: ${errorMock.message}` });
    });
  });

  // Teste para a função adicionarSafra
  describe('adicionarSafra', () => {
    it('deve adicionar uma nova safra e retornar o ID gerado', async () => {
      const req = { body: { nome: 'Nova Safra', CodigoUsuario: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const idMock = 1;

      safraModel.addSafra.mockResolvedValue(idMock);

      await safraController.adicionarSafra(req, res);

      expect(safraModel.addSafra).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ id: idMock, message: 'Safra adicionada com sucesso' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao adicionar safra', async () => {
      const req = { body: { nome: 'Nova Safra', CodigoUsuario: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao adicionar safra');

      safraModel.addSafra.mockRejectedValue(errorMock);

      await safraController.adicionarSafra(req, res);

      expect(safraModel.addSafra).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao adicionar safra: ${errorMock.message}` });
    });
  });

  // Teste para a função getSafraById
  describe('getSafraById', () => {
    it('deve retornar uma safra pelo ID com sucesso', async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const safraMock = { id: 1, nome: 'Safra 1', descricao: 'Descrição da safra' };

      safraModel.getSafraById.mockResolvedValue(safraMock);

      await safraController.getSafraById(req, res);

      expect(safraModel.getSafraById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(safraMock);
    });

    it('deve retornar erro 404 se a safra não for encontrada', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      safraModel.getSafraById.mockResolvedValue(null);

      await safraController.getSafraById(req, res);

      expect(safraModel.getSafraById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Safra não encontrada' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao buscar a safra', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const errorMock = new Error('Erro ao buscar safra');

      safraModel.getSafraById.mockRejectedValue(errorMock);

      await safraController.getSafraById(req, res);

      expect(safraModel.getSafraById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao buscar safra', error: errorMock });
    });
  });

  // Teste para a função atualizarSafra
  describe('atualizarSafra', () => {
    it('deve atualizar uma safra com sucesso', async () => {
      const req = { params: { id: 1 }, body: { nome: 'Safra Atualizada', CodigoUsuario: 1 } };
      const res = { send: jest.fn() };
      const updatedMock = 1;

      safraModel.updateSafra.mockResolvedValue(updatedMock);

      await safraController.atualizarSafra(req, res);

      expect(safraModel.updateSafra).toHaveBeenCalledWith(req.body, 1);
      expect(res.send).toHaveBeenCalledWith({ message: 'Safra atualizada com sucesso.' });
    });

    it('deve retornar erro 404 se a safra não for encontrada para atualização', async () => {
      const req = { params: { id: 1 }, body: { nome: 'Safra Atualizada', CodigoUsuario: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const updatedMock = 0;

      safraModel.updateSafra.mockResolvedValue(updatedMock);

      await safraController.atualizarSafra(req, res);

      expect(safraModel.updateSafra).toHaveBeenCalledWith(req.body, 1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Safra não encontrada.' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao atualizar a safra', async () => {
      const req = { params: { id: 1 }, body: { nome: 'Safra Atualizada', CodigoUsuario: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao atualizar safra');

      safraModel.updateSafra.mockRejectedValue(errorMock);

      await safraController.atualizarSafra(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao atualizar safra: ${errorMock.message}` });
    });
  });

  // Teste para a função deletarSafra
  describe('deletarSafra', () => {
    it('deve deletar uma safra com sucesso', async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      safraModel.deleteSafra.mockResolvedValue(changesMock);

      await safraController.deletarSafra(req, res);

      expect(safraModel.deleteSafra).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({ message: 'Safra deletada com sucesso' });
    });

    it('deve retornar erro 404 se a safra não for encontrada para exclusão', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      safraModel.deleteSafra.mockResolvedValue(changesMock);

      await safraController.deletarSafra(req, res);

      expect(safraModel.deleteSafra).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Safra não encontrada' });
    });

    it('deve retornar erro 500 se ocorrer um erro ao deletar a safra', async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error('Erro ao deletar safra');

      safraModel.deleteSafra.mockRejectedValue(errorMock);

      await safraController.deletarSafra(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: `Erro ao deletar safra: ${errorMock.message}` });
    });
  });
});
