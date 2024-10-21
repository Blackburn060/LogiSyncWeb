const userController = require("../../../src/Controllers/userController");
const userModel = require("../../../src/models/userModel");
const bcrypt = require("bcrypt");

// Mock do userModel e bcrypt
jest.mock("../../../src/models/userModel");
jest.mock("bcrypt");

describe("UserController", () => {
  beforeAll(() => {
    // Suprimir logs de erro
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restaurar comportamento original
    console.error.mockRestore();
  });

  // Teste para a função listarUsuarios
  describe("listarUsuarios", () => {
    it("deve retornar uma lista de usuários com sucesso", async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      const usuariosMock = [
        { id: 1, nome: "Usuário 1" },
        { id: 2, nome: "Usuário 2" },
      ];

      userModel.getAllUsers.mockResolvedValue(usuariosMock);

      await userController.listarUsuarios(req, res);

      expect(userModel.getAllUsers).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(usuariosMock);
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar usuários", async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar usuários");

      userModel.getAllUsers.mockRejectedValue(errorMock);

      await userController.listarUsuarios(req, res);

      expect(userModel.getAllUsers).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao buscar usuários: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função listarUsuario
  describe("listarUsuario", () => {
    it("deve retornar um usuário pelo ID com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const usuarioMock = { id: 1, nome: "Usuário 1" };

      userModel.getUserById.mockResolvedValue(usuarioMock);

      await userController.listarUsuario(req, res);

      expect(userModel.getUserById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(usuarioMock);
    });

    it("deve retornar erro 404 se o usuário não for encontrado", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.getUserById.mockResolvedValue(null);

      await userController.listarUsuario(req, res);

      expect(userModel.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário não encontrado",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar o usuário", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar usuário");

      userModel.getUserById.mockRejectedValue(errorMock);

      await userController.listarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao buscar usuário: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função adicionarUsuario
  describe("adicionarUsuario", () => {
    it("deve adicionar um novo usuário com sucesso", async () => {
      const req = {
        body: {
          nomeCompleto: "Novo Usuário",
          email: "novo@teste.com",
          senha: "senha123",
          tipoUsuario: "admin",
          codigoTransportadora: null,
          numeroCelular: "999999999",
          cpf: "12345678900",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const userIdMock = 1;

      userModel.findUserByEmail.mockResolvedValue(null); // Simula que o usuário não existe
      bcrypt.hash.mockResolvedValue("hashed-senha123");
      userModel.addUser.mockResolvedValue(userIdMock);

      await userController.adicionarUsuario(req, res);

      expect(userModel.findUserByEmail).toHaveBeenCalledWith("novo@teste.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 10);
      expect(userModel.addUser).toHaveBeenCalledWith({
        nomeCompleto: "Novo Usuário",
        email: "novo@teste.com",
        senha: "hashed-senha123",
        tipoUsuario: "admin",
        codigoTransportadora: null,
        situacaoUsuario: 1,
        numeroCelular: "999999999",
        cpf: "12345678900",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        id: userIdMock,
        message: "Usuário adicionado com sucesso",
      });
    });

    it("deve retornar erro 400 se o e-mail já estiver em uso", async () => {
      const req = {
        body: {
          nomeCompleto: "Novo Usuário",
          email: "novo@teste.com",
          senha: "senha123",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findUserByEmail.mockResolvedValue({
        id: 1,
        email: "novo@teste.com",
      }); // Simula que o e-mail já está em uso

      await userController.adicionarUsuario(req, res);

      expect(userModel.findUserByEmail).toHaveBeenCalledWith("novo@teste.com");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "E-mail já está em uso.",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao adicionar usuário", async () => {
      const req = {
        body: {
          nomeCompleto: "Novo Usuário",
          email: "novo@teste.com",
          senha: "senha123",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao adicionar usuário");

      userModel.findUserByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed-senha123");
      userModel.addUser.mockRejectedValue(errorMock);

      await userController.adicionarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao adicionar usuário: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função atualizarUsuario
  describe("atualizarUsuario", () => {
    it("deve atualizar um usuário com sucesso", async () => {
      const req = {
        params: { id: 1 },
        body: { nomeCompleto: "Usuário Atualizado" },
      };
      const res = { send: jest.fn() };
      const changesMock = 1;

      userModel.updateUser.mockResolvedValue(changesMock);

      await userController.atualizarUsuario(req, res);

      expect(userModel.updateUser).toHaveBeenCalledWith(req.body, 1);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário atualizado com sucesso",
      });
    });

    it("deve retornar erro 400 se não houver dados para atualizar", async () => {
      const req = { params: { id: 1 }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await userController.atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Nenhum dado para atualizar",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao atualizar o usuário", async () => {
      const req = {
        params: { id: 1 },
        body: { nomeCompleto: "Usuário Atualizado" },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao atualizar usuário");

      userModel.updateUser.mockRejectedValue(errorMock);

      await userController.atualizarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao atualizar usuário: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função deletarUsuario
  describe("deletarUsuario", () => {
    it("deve deletar um usuário com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      userModel.deleteUser.mockResolvedValue(changesMock);

      await userController.deletarUsuario(req, res);

      expect(userModel.deleteUser).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário deletado com sucesso",
      });
    });

    it("deve retornar erro 404 se o usuário não for encontrado", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      userModel.deleteUser.mockResolvedValue(changesMock);

      await userController.deletarUsuario(req, res);

      expect(userModel.deleteUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Usuário não encontrado",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao deletar o usuário", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao deletar usuário");

      userModel.deleteUser.mockRejectedValue(errorMock);

      await userController.deletarUsuario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao deletar usuário: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função verificarEmailExistente
  describe("verificarEmailExistente", () => {
    it("deve retornar que o e-mail existe e está ativo", async () => {
      const req = { query: { email: "teste@teste.com" } };
      const res = { json: jest.fn() };
      const userMock = { email: "teste@teste.com", SituacaoUsuario: 1 };

      userModel.findUserByEmail.mockResolvedValue(userMock);

      await userController.verificarEmailExistente(req, res);

      expect(userModel.findUserByEmail).toHaveBeenCalledWith("teste@teste.com");
      expect(res.json).toHaveBeenCalledWith({ exists: true, active: true });
    });

    it("deve retornar que o e-mail não existe", async () => {
      const req = { query: { email: "teste@teste.com" } };
      const res = { json: jest.fn() };

      userModel.findUserByEmail.mockResolvedValue(null);

      await userController.verificarEmailExistente(req, res);

      expect(userModel.findUserByEmail).toHaveBeenCalledWith("teste@teste.com");
      expect(res.json).toHaveBeenCalledWith({ exists: false, active: false });
    });

    it("deve retornar erro 500 se ocorrer um erro ao verificar o e-mail", async () => {
      const req = { query: { email: "teste@teste.com" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao verificar e-mail");

      userModel.findUserByEmail.mockRejectedValue(errorMock);

      await userController.verificarEmailExistente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao verificar e-mail: ${errorMock.message}`,
      });
    });
  });
});
