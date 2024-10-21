const agendamentoModel = require('../../../src/models/agendamentoModel');
const db = require('../../../src/Config/database');

// Mock do db
jest.mock('../../../src/Config/database');

describe('AgendamentoModel', () => {

  // Teste para getAllAgendamentos
  describe('getAllAgendamentos', () => {
    it('deve retornar todos os agendamentos com os filtros aplicados', async () => {
      const filters = { CodigoUsuario: 1 };
      const agendamentosMock = [{ id: 1, nome: 'Agendamento 1' }, { id: 2, nome: 'Agendamento 2' }];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, agendamentosMock);
      });

      const result = await agendamentoModel.getAllAgendamentos(filters);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(agendamentosMock);
    });

    it('deve retornar erro ao buscar agendamentos', async () => {
      const filters = { CodigoUsuario: 1 };
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar agendamentos'), null);
      });

      await expect(agendamentoModel.getAllAgendamentos(filters)).rejects.toThrow('Erro ao buscar agendamentos');
    });
  });

  // Teste para getAgendamentosPorData
  describe('getAgendamentosPorData', () => {
    it('deve retornar agendamentos ordenados pela hora', async () => {
      const dataAgendamento = '2024-10-01';
      const agendamentosMock = [{ id: 1, HoraAgendamento: '09:00' }, { id: 2, HoraAgendamento: '10:00' }];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, agendamentosMock);
      });

      const result = await agendamentoModel.getAgendamentosPorData(dataAgendamento);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [dataAgendamento], expect.any(Function));
      expect(result).toEqual(agendamentosMock);
    });

    it('deve lançar erro ao buscar agendamentos por data', async () => {
      const dataAgendamento = '2024-10-01';
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar agendamentos'), null);
      });

      await expect(agendamentoModel.getAgendamentosPorData(dataAgendamento)).rejects.toThrow('Erro ao buscar agendamentos');
    });
  });

  // Teste para getAgendamentosPorStatus
  describe('getAgendamentosPorStatus', () => {
    it('deve retornar agendamentos com os status corretos', async () => {
      const agendamentosMock = [
        { id: 1, SituacaoAgendamento: 'Confirmado' },
        { id: 2, SituacaoAgendamento: 'Andamento' }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, agendamentosMock);
      });

      const result = await agendamentoModel.getAgendamentosPorStatus();
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [], expect.any(Function));
      expect(result).toEqual(agendamentosMock);
    });

    it('deve lançar erro ao buscar agendamentos por status', async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar agendamentos'), null);
      });

      await expect(agendamentoModel.getAgendamentosPorStatus()).rejects.toThrow('Erro ao buscar agendamentos');
    });
  });

  // Teste para addAgendamento
  describe('addAgendamento', () => {
    it('deve adicionar um novo agendamento e retornar o ID gerado', async () => {
      const agendamentoData = {
        CodigoUsuario: 1,
        CodigoVeiculo: 2,
        CodigoProduto: 3,
        DataAgendamento: '2024-10-01',
        HoraAgendamento: '09:00',
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.lastID = 1;  // Simula retorno do ID gerado
      });

      const result = await agendamentoModel.addAgendamento(agendamentoData);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar adicionar agendamento', async () => {
      const agendamentoData = {
        CodigoUsuario: 1,
        CodigoVeiculo: 2,
        CodigoProduto: 3,
        DataAgendamento: '2024-10-01',
        HoraAgendamento: '09:00',
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao adicionar agendamento'));
      });

      await expect(agendamentoModel.addAgendamento(agendamentoData)).rejects.toThrow('Erro ao adicionar agendamento');
    });
  });

  // Teste para updateAgendamento
  describe('updateAgendamento', () => {
    it('deve atualizar um agendamento com sucesso', async () => {
      const changes = {
        Observacao: 'Atualizado',
        UsuarioAprovacao: 'admin',
        SituacaoAgendamento: 'Confirmado',
        TipoAgendamento: 'Normal'
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simula sucesso na atualização
      });

      const result = await agendamentoModel.updateAgendamento(changes, 1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar agendamento', async () => {
      const changes = {
        Observacao: 'Atualizado',
        UsuarioAprovacao: 'admin',
        SituacaoAgendamento: 'Confirmado',
        TipoAgendamento: 'Normal'
      };
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar agendamento'));
      });

      await expect(agendamentoModel.updateAgendamento(changes, 1)).rejects.toThrow('Erro ao atualizar agendamento');
    });
  });

  // Teste para deleteAgendamento
  describe('deleteAgendamento', () => {
    it('deve deletar um agendamento com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simula sucesso na exclusão
      });

      const result = await agendamentoModel.deleteAgendamento(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), 1, expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar deletar agendamento', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao deletar agendamento'));
      });

      await expect(agendamentoModel.deleteAgendamento(1)).rejects.toThrow('Erro ao deletar agendamento');
    });
  });
});
