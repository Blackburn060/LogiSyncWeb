const AuthController = require('../../../src/Controllers/authController');
const AuthService = require('../../../src/services/authService');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/userModel');
const { enviarEmailRecuperacaoSenha, enviarEmailSenhaTemporaria } = require('../../../src/utils/emailService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Mockando os módulos usados no AuthController
jest.mock('../../../src/services/authService');
jest.mock('jsonwebtoken');
jest.mock('../../../src/models/userModel');
jest.mock('../../../src/utils/emailService');
jest.mock('bcrypt');
jest.mock('crypto');

describe('AuthController', () => {

  // Testes para a função login
  describe('login', () => {
    it('deve retornar um token e um refresh token no login bem-sucedido', async () => {
      const req = { body: { email: 'user@example.com', senha: 'password123' } };
      const res = { json: jest.fn() };
      const tokenMock = 'fake-jwt-token';
      const refreshTokenMock = 'fake-refresh-token';
      
      AuthService.login.mockResolvedValue({ token: tokenMock, refreshToken: refreshTokenMock });

      await AuthController.login(req, res);

      expect(AuthService.login).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(res.json).toHaveBeenCalledWith({ token: tokenMock, refreshToken: refreshTokenMock });
    });

    it('deve retornar erro 400 se o login falhar', async () => {
      const req = { body: { email: 'user@example.com', senha: 'wrong-password' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const errorMock = new Error('Credenciais inválidas');
      AuthService.login.mockRejectedValue(errorMock);

      await AuthController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Credenciais inválidas' });
    });
  });

  // Testes para a função registro
  describe('registro', () => {
    it('deve retornar um token e um refresh token no registro bem-sucedido', async () => {
      const req = { body: { email: 'newuser@example.com', senha: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const tokenMock = 'fake-jwt-token';
      const refreshTokenMock = 'fake-refresh-token';
      
      AuthService.registro.mockResolvedValue({ token: tokenMock, refreshToken: refreshTokenMock });

      await AuthController.registro(req, res);

      expect(AuthService.registro).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token: tokenMock, refreshToken: refreshTokenMock });
    });

    it('deve retornar erro 400 se o registro falhar', async () => {
      const req = { body: { email: 'newuser@example.com', senha: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const errorMock = new Error('Erro ao registrar');
      AuthService.registro.mockRejectedValue(errorMock);

      await AuthController.registro(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao registrar' });
    });
  });

  // Testes para a função recuperarSenha
  describe('recuperarSenha', () => {
    it('deve enviar e-mail de recuperação de senha se o e-mail for válido', async () => {
      const req = { body: { email: 'user@example.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const userMock = { CodigoUsuario: 1, Email: 'user@example.com' };
      const resetTokenMock = 'reset-token';

      User.findUserByEmail.mockResolvedValue(userMock);
      crypto.randomBytes.mockReturnValue(Buffer.from(resetTokenMock));
      bcrypt.hash.mockResolvedValue('hashed-reset-token');

      await AuthController.recuperarSenha(req, res);

      expect(User.findUserByEmail).toHaveBeenCalledWith('user@example.com');
      expect(User.savePasswordResetToken).toHaveBeenCalledWith(1, 'hashed-reset-token');
      expect(enviarEmailRecuperacaoSenha).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Se o e-mail existir, um link de recuperação foi enviado.',
      });
    });

    it('deve retornar erro 500 se ocorrer um erro ao processar a solicitação', async () => {
      const req = { body: { email: 'user@example.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      User.findUserByEmail.mockRejectedValue(new Error('Erro ao buscar usuário'));

      await AuthController.recuperarSenha(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao processar a solicitação.' });
    });
  });

  // Testes para a função redefinirSenha
  describe('redefinirSenha', () => {
    it('deve redefinir a senha se o token for válido', async () => {
      const req = { body: { token: 'valid-token', id: 1, novaSenha: 'new-password' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const userMock = { CodigoUsuario: 1, ResetTokenHash: 'hashed-token' };

      User.getUserById.mockResolvedValue(userMock);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed-new-password');

      await AuthController.redefinirSenha(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('valid-token', 'hashed-token');
      expect(User.updatePassword).toHaveBeenCalledWith(1, 'hashed-new-password');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Senha redefinida com sucesso.' });
    });

    it('deve retornar erro 400 se o token for inválido', async () => {
      const req = { body: { token: 'invalid-token', id: 1, novaSenha: 'new-password' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const userMock = { CodigoUsuario: 1, ResetTokenHash: 'hashed-token' };

      User.getUserById.mockResolvedValue(userMock);
      bcrypt.compare.mockResolvedValue(false);

      await AuthController.redefinirSenha(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('invalid-token', 'hashed-token');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado.' });
    });
  });
});
