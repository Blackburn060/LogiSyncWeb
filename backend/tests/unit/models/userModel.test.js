const userModel = require('../../../src/models/userModel');
const db = require('../../../src/Config/database');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');

// Mock do db e bcrypt
jest.mock('../../../src/Config/database');
jest.mock('bcrypt');

describe('UserModel', () => {

  // Teste para getAllUsers
  describe('getAllUsers', () => {
    it('deve retornar todos os usuários com filtros aplicados', async () => {
      const filters = { NomeCompleto: 'João' };
      const usersMock = [
        { CodigoUsuario: 1, NomeCompleto: 'João Silva' },
        { CodigoUsuario: 2, NomeCompleto: 'João Pereira' }
      ];
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, usersMock);
      });

      const result = await userModel.getAllUsers(filters);
      expect(db.all).toHaveBeenCalledWith(expect.any(String), [expect.stringContaining('João')], expect.any(Function));
      expect(result).toEqual(usersMock);
    });

    it('deve lançar erro ao buscar usuários', async () => {
      const filters = { NomeCompleto: 'João' };
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar usuários'), null);
      });

      await expect(userModel.getAllUsers(filters)).rejects.toThrow('Erro ao buscar usuários');
    });
  });

  // Teste para addUser
  describe('addUser', () => {
    it('deve adicionar um novo usuário e retornar o ID gerado', async () => {
      const userData = {
        nomeCompleto: 'João Silva',
        codigoTransportadora: 1,
        email: 'joao@gmail.com',
        senha: 'senha123',
        tipoUsuario: 'admin',
        numeroCelular: '1234567890',
        cpf: '12345678900'
      };

      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.lastID = 1;  // Simulando o ID gerado
      });

      const result = await userModel.addUser(userData);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar adicionar um novo usuário', async () => {
      const userData = {
        nomeCompleto: 'João Silva',
        codigoTransportadora: 1,
        email: 'joao@gmail.com',
        senha: 'senha123',
        tipoUsuario: 'admin',
        numeroCelular: '1234567890',
        cpf: '12345678900'
      };

      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao adicionar usuário'));
      });

      await expect(userModel.addUser(userData)).rejects.toThrow('Erro ao adicionar usuário');
    });
  });

  // Teste para getUserById
  describe('getUserById', () => {
    it('deve retornar o usuário pelo ID', async () => {
      const userMock = { CodigoUsuario: 1, NomeCompleto: 'João Silva', Email: 'joao@gmail.com' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, userMock);
      });

      const result = await userModel.getUserById(1);
      expect(db.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));
      expect(result).toEqual(userMock);
    });

    it('deve lançar erro ao buscar usuário pelo ID', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar usuário'), null);
      });

      await expect(userModel.getUserById(1)).rejects.toThrow('Erro ao buscar usuário');
    });
  });

  // Teste para findUserByEmail
  describe('findUserByEmail', () => {
    it('deve retornar o usuário pelo email', async () => {
      const userMock = { CodigoUsuario: 1, NomeCompleto: 'João Silva', Email: 'joao@gmail.com' };
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, userMock);
      });

      const result = await userModel.findUserByEmail('joao@gmail.com');
      expect(db.get).toHaveBeenCalledWith(expect.any(String), ['joao@gmail.com'], expect.any(Function));
      expect(result).toEqual(userMock);
    });

    it('deve lançar erro ao buscar usuário pelo email', async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao buscar usuário'), null);
      });

      await expect(userModel.findUserByEmail('joao@gmail.com')).rejects.toThrow('Erro ao buscar usuário');
    });
  });

  // Teste para updateUser
  describe('updateUser', () => {
    it('deve atualizar um usuário com sucesso', async () => {
      const userUpdate = { NomeCompleto: 'João Atualizado', Senha: 'novaSenha123' };
      
      bcrypt.hash.mockResolvedValue('hashedNovaSenha123');  // Mock do hash da senha

      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na atualização
      });

      const result = await userModel.updateUser(userUpdate, 1);
      expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar atualizar um usuário', async () => {
      const userUpdate = { NomeCompleto: 'João Atualizado', Senha: 'novaSenha123' };
      
      bcrypt.hash.mockResolvedValue('hashedNovaSenha123');  // Mock do hash da senha
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar usuário'));
      });

      await expect(userModel.updateUser(userUpdate, 1)).rejects.toThrow('Erro ao atualizar usuário');
    });

    it('deve lançar erro se não houver campos para atualizar', async () => {
      await expect(userModel.updateUser({}, 1)).rejects.toThrow('No fields to update');
    });
  });

  // Teste para deleteUser
  describe('deleteUser', () => {
    it('deve inativar um usuário com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
        this.changes = 1;  // Simulando sucesso na exclusão
      });

      const result = await userModel.deleteUser(1);
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toEqual(1);
    });

    it('deve lançar erro ao tentar inativar um usuário', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao inativar usuário'));
      });

      await expect(userModel.deleteUser(1)).rejects.toThrow('Erro ao inativar usuário');
    });
  });

  // Teste para savePasswordResetToken
  describe('savePasswordResetToken', () => {
    it('deve salvar o token de redefinição de senha com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await userModel.savePasswordResetToken(1, 'hashedToken');
      expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      expect(result).toBeUndefined();  // A função não retorna nada em caso de sucesso
    });

    it('deve lançar erro ao tentar salvar o token de redefinição de senha', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao salvar token de redefinição de senha'));
      });

      await expect(userModel.savePasswordResetToken(1, 'hashedToken')).rejects.toThrow('Erro ao salvar token de redefinição de senha');
    });
  });

  // Teste para updatePassword
  describe('updatePassword', () => {
    it('deve atualizar a senha com sucesso', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await userModel.updatePassword(1, 'hashedNovaSenha');
      expect(db.run).toHaveBeenCalledWith(expect.any(String), ['hashedNovaSenha', 1], expect.any(Function));
      expect(result).toBeUndefined();  // A função não retorna nada em caso de sucesso
    });

    it('deve lançar erro ao tentar atualizar a senha', async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error('Erro ao atualizar senha'));
      });

      await expect(userModel.updatePassword(1, 'hashedNovaSenha')).rejects.toThrow('Erro ao atualizar senha');
    });
  });
});
