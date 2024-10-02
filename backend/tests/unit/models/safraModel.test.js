const safraModel = require('../../../src/models/safraModel');
const db = require('../../../src/Config/database');
const moment = require('moment-timezone');

// Mock do db
jest.mock('../../../src/Config/database');

describe('SafraModel', () => {

  // Teste para getAllSafras
  describe('getAllSafras', () => {
    it('deve retornar todas as safras com os filtros aplicados', async () => {
      const filters = { AnoSafra: '2024' };
      const safrasMock = [
        { CodigoSafra: 1, AnoSafra: '2024', SituacaoSafra: 1 },
        { CodigoSafra: 2, AnoSafra: '2024', SituacaoSafra: 1 }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, safrasMock);
      });

      const result = await safraModel.getAllSafras(filters);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [filters.AnoSafra], expect.any(Function));
      expect(result).toEqual(safrasMock);
    });

    it('deve lançar erro ao buscar safras', async () => {
      const filters = { AnoSafra: '2024' };
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar safras'), null);
      });

      await expect(safraModel.getAllSafras(filters)).rejects.toThrow('Erro ao buscar safras');
    });
  });

  // Teste para addSafra
  describe('addSafra', () => {
    it('deve adicionar uma nova safra e retornar o ID gerado', async () => {
      const safraData = {
        AnoSafra: '2024',
        SituacaoSafra: 1,
        CodigoUsuario: 1
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.lastID = 1;  // Simulando o ID gerado
      });

      const result = await safraModel.addSafra(safraData);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar adicionar uma nova safra', async () => {
      const safraData = {
        AnoSafra: '2024',
        SituacaoSafra: 1,
        CodigoUsuario: 1
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao adicionar safra'));
      });

      await expect(safraModel.addSafra(safraData)).rejects.toThrow('Erro ao adicionar safra');
    });
  });

  // Teste para getSafraById
  describe('getSafraById', () => {
    it('deve retornar a safra pelo ID', async () => {
      const safraMock = { CodigoSafra: 1, AnoSafra: '2024', SituacaoSafra: 1 };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, safraMock);
      });

      const result = await safraModel.getSafraById(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(safraMock);
    });

    it('deve lançar erro ao buscar safra pelo ID', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar safra'), null);
      });

      await expect(safraModel.getSafraById(1)).rejects.toThrow('Erro ao buscar safra');
    });
  });

  // Teste para updateSafra
  describe('updateSafra', () => {
    it('deve atualizar uma safra com sucesso', async () => {
      const safraUpdate = { AnoSafra: '2025', SituacaoSafra: 1 };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na atualização
      });

      const result = await safraModel.updateSafra(safraUpdate, 1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar uma safra', async () => {
      const safraUpdate = { AnoSafra: '2025', SituacaoSafra: 1 };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar safra'));
      });

      await expect(safraModel.updateSafra(safraUpdate, 1)).rejects.toThrow('Erro ao atualizar safra');
    });

    it('deve lançar erro se não houver campos para atualizar', async () => {
      await expect(safraModel.updateSafra({}, 1)).rejects.toThrow('No fields to update');
    });
  });

  // Teste para deleteSafra
  describe('deleteSafra', () => {
    it('deve realizar soft delete em uma safra com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na exclusão
      });

      const result = await safraModel.deleteSafra(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar realizar soft delete em uma safra', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao deletar safra'));
      });

      await expect(safraModel.deleteSafra(1)).rejects.toThrow('Erro ao deletar safra');
    });
  });
});
