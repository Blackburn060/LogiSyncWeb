const veiculoModel = require('../../../src/models/veiculoModel');
const db = require('../../../src/Config/database');
const moment = require('moment-timezone');

// Mock do db
jest.mock('../../../src/Config/database');

describe('VeiculoModel', () => {

  // Teste para getAllVeiculos
  describe('getAllVeiculos', () => {
    it('deve retornar todos os veículos com filtros aplicados', async () => {
      const filters = { Placa: 'ABC1234' };
      const veiculosMock = [
        { CodigoVeiculo: 1, NomeVeiculo: 'Caminhão', Placa: 'ABC1234' },
        { CodigoVeiculo: 2, NomeVeiculo: 'Carro', Placa: 'XYZ5678' }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, veiculosMock);
      });

      const result = await veiculoModel.getAllVeiculos(filters);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [filters.Placa], expect.any(Function));
      expect(result).toEqual(veiculosMock);
    });

    it('deve lançar erro ao buscar veículos', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar veículos'), null);
      });

      await expect(veiculoModel.getAllVeiculos({})).rejects.toThrow('Erro ao buscar veículos');
    });
  });

  // Teste para addVeiculo
  describe('addVeiculo', () => {
    it('deve adicionar um novo veículo e retornar o ID gerado', async () => {
      const veiculoData = {
        CodigoUsuario: 1,
        NomeVeiculo: 'Caminhão',
        Placa: 'ABC1234',
        Marca: 'Volvo',
        ModeloTipo: 'FH16',
        AnoFabricacao: 2022,
        Cor: 'Branco',
        CapacidadeCarga: 20000
      };

      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.lastID = 1;  // Simulando o ID gerado
      });

      const result = await veiculoModel.addVeiculo(veiculoData);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar adicionar um novo veículo', async () => {
      const veiculoData = {
        CodigoUsuario: 1,
        NomeVeiculo: 'Caminhão',
        Placa: 'ABC1234',
        Marca: 'Volvo',
        ModeloTipo: 'FH16',
        AnoFabricacao: 2022,
        Cor: 'Branco',
        CapacidadeCarga: 20000
      };

      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao adicionar veículo'));
      });

      await expect(veiculoModel.addVeiculo(veiculoData)).rejects.toThrow('Erro ao adicionar veículo');
    });
  });

  // Teste para getVeiculoById
  describe('getVeiculoById', () => {
    it('deve retornar o veículo pelo ID', async () => {
      const veiculoMock = { CodigoVeiculo: 1, NomeVeiculo: 'Caminhão', Placa: 'ABC1234' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, veiculoMock);
      });

      const result = await veiculoModel.getVeiculoById(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(veiculoMock);
    });

    it('deve lançar erro ao buscar veículo pelo ID', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar veículo'), null);
      });

      await expect(veiculoModel.getVeiculoById(1)).rejects.toThrow('Erro ao buscar veículo');
    });
  });

  // Teste para updateVeiculo
  describe('updateVeiculo', () => {
    it('deve atualizar um veículo com sucesso', async () => {
      const veiculoUpdate = { NomeVeiculo: 'Caminhão Atualizado', Placa: 'XYZ5678' };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na atualização
      });

      const result = await veiculoModel.updateVeiculo(veiculoUpdate, 1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar um veículo', async () => {
      const veiculoUpdate = { NomeVeiculo: 'Caminhão Atualizado', Placa: 'XYZ5678' };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar veículo'));
      });

      await expect(veiculoModel.updateVeiculo(veiculoUpdate, 1)).rejects.toThrow('Erro ao atualizar veículo');
    });

    it('deve lançar erro se não houver campos para atualizar', async () => {
      await expect(veiculoModel.updateVeiculo({}, 1)).rejects.toThrow('No fields to update');
    });
  });

  // Teste para deleteVeiculo
  describe('deleteVeiculo', () => {
    it('deve inativar um veículo com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na exclusão
      });

      const result = await veiculoModel.deleteVeiculo(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar inativar um veículo', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao inativar veículo'));
      });

      await expect(veiculoModel.deleteVeiculo(1)).rejects.toThrow('Erro ao inativar veículo');
    });
  });
});
