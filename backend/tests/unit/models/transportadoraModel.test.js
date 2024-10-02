const transportadoraModel = require('../../../src/models/transportadoraModel');
const db = require('../../../src/Config/database');
const moment = require('moment-timezone');

// Mock do db
jest.mock('../../../src/Config/database');

describe('TransportadoraModel', () => {

  // Teste para getAllTransportadoras
  describe('getAllTransportadoras', () => {
    it('deve retornar todas as transportadoras ativas com filtros aplicados', async () => {
      const filters = { Nome: 'Transportadora X' };
      const transportadorasMock = [
        { CodigoTransportadora: 1, Nome: 'Transportadora X', SituacaoTransportadora: 1 },
        { CodigoTransportadora: 2, Nome: 'Transportadora Y', SituacaoTransportadora: 1 }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, transportadorasMock);
      });

      const result = await transportadoraModel.getAllTransportadoras(filters);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [expect.stringContaining('Transportadora X')], expect.any(Function));
      expect(result).toEqual(transportadorasMock);
    });

    it('deve lançar erro ao buscar todas as transportadoras', async () => {
      const filters = { Nome: 'Transportadora X' };
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar transportadoras'), null);
      });

      await expect(transportadoraModel.getAllTransportadoras(filters)).rejects.toThrow('Erro ao buscar transportadoras');
    });
  });

  // Teste para addTransportadora
  describe('addTransportadora', () => {
    it('deve adicionar uma nova transportadora e retornar os dados da transportadora adicionada', async () => {
      const transportadoraData = {
        nomeEmpresa: 'Transportadora X',
        nomeFantasia: 'Fantasia X',
        cnpj: '12345678901234'
      };
      const userId = 1;

      db.run.mockImplementationOnce((sql, params, callback) => {
        callback(null);
        this.lastID = 10;  // Simula o ID gerado
      });

      db.run.mockImplementationOnce((sql, params, callback) => {
        callback(null);  // Simula a atualização do usuário
      });

      const result = await transportadoraModel.addTransportadora(transportadoraData, userId);
      expect(db.run).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        CodigoTransportadora: 10,
        nomeEmpresa: transportadoraData.nomeEmpresa,
        nomeFantasia: transportadoraData.nomeFantasia,
        cnpj: transportadoraData.cnpj,
        SituacaoTransportadora: 1,
        DataGeracao: expect.any(String)
      });
    });

    it('deve lançar erro ao tentar adicionar uma nova transportadora', async () => {
      const transportadoraData = {
        nomeEmpresa: 'Transportadora X',
        nomeFantasia: 'Fantasia X',
        cnpj: '12345678901234'
      };
      const userId = 1;

      db.run.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Erro ao adicionar transportadora'));
      });

      await expect(transportadoraModel.addTransportadora(transportadoraData, userId)).rejects.toThrow('Erro ao adicionar transportadora');
    });
  });

  // Teste para getTransportadoraById
  describe('getTransportadoraById', () => {
    it('deve retornar a transportadora pelo ID se estiver ativa', async () => {
      const transportadoraMock = { CodigoTransportadora: 1, Nome: 'Transportadora X', SituacaoTransportadora: 1 };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, transportadoraMock);
      });

      const result = await transportadoraModel.getTransportadoraById(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(transportadoraMock);
    });

    it('deve lançar erro ao buscar transportadora pelo ID', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar transportadora'), null);
      });

      await expect(transportadoraModel.getTransportadoraById(1)).rejects.toThrow('Erro ao buscar transportadora');
    });
  });

  // Teste para updateTransportadora
  describe('updateTransportadora', () => {
    it('deve atualizar uma transportadora com sucesso', async () => {
      const transportadoraUpdate = { Nome: 'Transportadora Atualizada', CNPJ: '98765432109876' };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na atualização
      });

      const result = await transportadoraModel.updateTransportadora(transportadoraUpdate, 1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar uma transportadora', async () => {
      const transportadoraUpdate = { Nome: 'Transportadora Atualizada', CNPJ: '98765432109876' };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar transportadora'));
      });

      await expect(transportadoraModel.updateTransportadora(transportadoraUpdate, 1)).rejects.toThrow('Erro ao atualizar transportadora');
    });

    it('deve lançar erro se não houver campos para atualizar', async () => {
      await expect(transportadoraModel.updateTransportadora({}, 1)).rejects.toThrow('No fields to update');
    });
  });

  // Teste para deleteTransportadora
  describe('deleteTransportadora', () => {
    it('deve realizar soft delete em uma transportadora com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na exclusão
      });

      const result = await transportadoraModel.deleteTransportadora(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar realizar soft delete em uma transportadora', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao deletar transportadora'));
      });

      await expect(transportadoraModel.deleteTransportadora(1)).rejects.toThrow('Erro ao deletar transportadora');
    });
  });
});
