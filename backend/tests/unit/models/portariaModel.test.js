const portariaModel = require('../../../src/models/portariaModel');
const db = require('../../../src/Config/database');

// Mock do db
jest.mock('../../../src/Config/database');

describe('PortariaModel', () => {

  // Teste para getAllPortarias
  describe('getAllPortarias', () => {
    it('deve retornar todos os dados da portaria', async () => {
      const portariasMock = [
        { CodigoPortaria: 1, CodigoAgendamento: 101, DataHoraEntrada: '2024-10-01 09:00:00' },
        { CodigoPortaria: 2, CodigoAgendamento: 102, DataHoraEntrada: '2024-10-02 10:00:00' }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, portariasMock);
      });

      const result = await portariaModel.getAllPortarias();
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [], expect.any(Function));
      expect(result).toEqual(portariasMock);
    });

    it('deve lançar erro ao buscar todos os dados da portaria', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar dados da portaria'), null);
      });

      await expect(portariaModel.getAllPortarias()).rejects.toThrow('Erro ao buscar dados da portaria');
    });
  });

  // Teste para getPortariaByCodigoAgendamento
  describe('getPortariaByCodigoAgendamento', () => {
    it('deve retornar os dados da portaria pelo CódigoAgendamento', async () => {
      const portariaMock = { CodigoPortaria: 1, CodigoAgendamento: 101, DataHoraEntrada: '2024-10-01 09:00:00' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, portariaMock);
      });

      const result = await portariaModel.getPortariaByCodigoAgendamento(101);
      expect(db.get).toHaveBeenCalledWith(expect.any(String), [101], expect.any(Function));
      expect(result).toEqual(portariaMock);
    });

    it('deve lançar erro ao buscar portaria pelo CódigoAgendamento', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar portaria'), null);
      });

      await expect(portariaModel.getPortariaByCodigoAgendamento(101)).rejects.toThrow('Erro ao buscar portaria');
    });
  });

  // Teste para addPortaria
  describe('addPortaria', () => {
    it('deve adicionar uma nova portaria e retornar o ID gerado', async () => {
      const portariaData = {
        CodigoAgendamento: 101,
        DataHoraEntrada: '2024-10-01 09:00:00',
        UsuarioAprovacao: 'admin',
        ObservacaoPortaria: 'Entrada realizada'
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null, { lastID: 1 });  // Simulando o ID gerado
      });

      const result = await portariaModel.addPortaria(portariaData);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar adicionar uma nova portaria', async () => {
      const portariaData = {
        CodigoAgendamento: 101,
        DataHoraEntrada: '2024-10-01 09:00:00',
        UsuarioAprovacao: 'admin',
        ObservacaoPortaria: 'Entrada realizada'
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao adicionar portaria'));
      });

      await expect(portariaModel.addPortaria(portariaData)).rejects.toThrow('Erro ao adicionar portaria');
    });
  });

  // Teste para updatePortaria
  describe('updatePortaria', () => {
    it('deve atualizar os dados da portaria com sucesso', async () => {
      const portariaUpdate = { DataHoraSaida: '2024-10-01 17:00:00', MotivoRecusa: null };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null, { changes: 1 });  // Simulando sucesso na atualização
      });

      const result = await portariaModel.updatePortaria(101, portariaUpdate);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar a portaria', async () => {
      const portariaUpdate = { DataHoraSaida: '2024-10-01 17:00:00', MotivoRecusa: null };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar portaria'));
      });

      await expect(portariaModel.updatePortaria(101, portariaUpdate)).rejects.toThrow('Erro ao atualizar portaria');
    });

    it('deve lançar erro se nenhum campo for passado para atualização', async () => {
      await expect(portariaModel.updatePortaria(101, {})).rejects.toThrow('Nenhum campo para atualizar.');
    });
  });

  // Teste para deletePortaria
  describe('deletePortaria', () => {
    it('deve deletar os dados da portaria com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null, { changes: 1 });  // Simulando sucesso na exclusão
      });

      const result = await portariaModel.deletePortaria(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar deletar a portaria', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao deletar portaria'));
      });

      await expect(portariaModel.deletePortaria(1)).rejects.toThrow('Erro ao deletar portaria');
    });
  });
});
