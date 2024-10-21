const transportadoraController = require("../../../src/Controllers/transportadoraController");
const transportadoraModel = require("../../../src/models/transportadoraModel");
const AuthService = require("../../../src/services/authService");

// Mock do transportadoraModel e AuthService
jest.mock("../../../src/models/transportadoraModel");
jest.mock("../../../src/services/authService");

describe("TransportadoraController", () => {
  beforeAll(() => {
    // Suprimir logs de erro
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restaurar comportamento original
    console.error.mockRestore();
  });

  // Teste para a função listarTransportadoras
  describe("listarTransportadoras", () => {
    it("deve retornar uma lista de transportadoras com sucesso", async () => {
      const req = { query: {} };
      const res = { json: jest.fn() };
      const transportadorasMock = [
        { id: 1, nome: "Transportadora 1" },
        { id: 2, nome: "Transportadora 2" },
      ];

      transportadoraModel.getAllTransportadoras.mockResolvedValue(
        transportadorasMock
      );

      await transportadoraController.listarTransportadoras(req, res);

      expect(transportadoraModel.getAllTransportadoras).toHaveBeenCalledWith(
        req.query
      );
      expect(res.json).toHaveBeenCalledWith(transportadorasMock);
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar transportadoras", async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar transportadoras");

      transportadoraModel.getAllTransportadoras.mockRejectedValue(errorMock);

      await transportadoraController.listarTransportadoras(req, res);

      expect(transportadoraModel.getAllTransportadoras).toHaveBeenCalledWith(
        req.query
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao buscar transportadoras: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função adicionarTransportadora
  describe("adicionarTransportadora", () => {
    it("deve adicionar uma nova transportadora e retornar o token e transportadora com sucesso", async () => {
      const req = {
        body: {
          Nome: "Empresa X",
          NomeFantasia: "Fantasia X",
          CNPJ: "123456789",
        },
        user: { id: 1 },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const novaTransportadoraMock = { CodigoTransportadora: 100 };
      const tokenMock = "new-access-token";

      transportadoraModel.addTransportadora.mockResolvedValue(
        novaTransportadoraMock
      );
      AuthService.generateToken.mockReturnValue(tokenMock);

      await transportadoraController.adicionarTransportadora(req, res);

      expect(transportadoraModel.addTransportadora).toHaveBeenCalledWith(
        req.body,
        req.user.id
      );
      expect(AuthService.generateToken).toHaveBeenCalledWith({
        ...req.user,
        CodigoTransportadora: novaTransportadoraMock.CodigoTransportadora,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora adicionada e usuário atualizado com sucesso",
        token: tokenMock,
        transportadora: novaTransportadoraMock,
      });
    });

    it("deve retornar erro 400 se campos obrigatórios estiverem ausentes", async () => {
      const req = { body: { Nome: "Empresa X" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await transportadoraController.adicionarTransportadora(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Campos obrigatórios ausentes",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao adicionar transportadora", async () => {
      const req = {
        body: {
          Nome: "Empresa X",
          NomeFantasia: "Fantasia X",
          CNPJ: "123456789",
        },
        user: { id: 1 },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao adicionar transportadora");

      transportadoraModel.addTransportadora.mockRejectedValue(errorMock);

      await transportadoraController.adicionarTransportadora(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao adicionar transportadora: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função atualizarTransportadora
  describe("atualizarTransportadora", () => {
    it("deve atualizar uma transportadora com sucesso", async () => {
      const req = { params: { id: 1 }, body: { Nome: "Nova Transportadora" } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      transportadoraModel.updateTransportadora.mockResolvedValue(changesMock);

      await transportadoraController.atualizarTransportadora(req, res);

      expect(transportadoraModel.updateTransportadora).toHaveBeenCalledWith(
        req.body,
        1
      );
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora atualizada com sucesso",
      });
    });

    it("deve retornar erro 404 se a transportadora não for encontrada para atualização", async () => {
      const req = { params: { id: 1 }, body: { Nome: "Nova Transportadora" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      transportadoraModel.updateTransportadora.mockResolvedValue(changesMock);

      await transportadoraController.atualizarTransportadora(req, res);

      expect(transportadoraModel.updateTransportadora).toHaveBeenCalledWith(
        req.body,
        1
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora não encontrada",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao atualizar a transportadora", async () => {
      const req = { params: { id: 1 }, body: { Nome: "Nova Transportadora" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao atualizar transportadora");

      transportadoraModel.updateTransportadora.mockRejectedValue(errorMock);

      await transportadoraController.atualizarTransportadora(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao atualizar transportadora: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função deletarTransportadora
  describe("deletarTransportadora", () => {
    it("deve inativar uma transportadora com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      transportadoraModel.deleteTransportadora.mockResolvedValue(changesMock);

      await transportadoraController.deletarTransportadora(req, res);

      expect(transportadoraModel.deleteTransportadora).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora inativada com sucesso",
      });
    });

    it("deve retornar erro 404 se a transportadora não for encontrada para exclusão", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      transportadoraModel.deleteTransportadora.mockResolvedValue(changesMock);

      await transportadoraController.deletarTransportadora(req, res);

      expect(transportadoraModel.deleteTransportadora).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora não encontrada",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao inativar a transportadora", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao inativar transportadora");

      transportadoraModel.deleteTransportadora.mockRejectedValue(errorMock);

      await transportadoraController.deletarTransportadora(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao inativar transportadora: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função getTransportadoraById
  describe("getTransportadoraById", () => {
    it("deve retornar uma transportadora pelo ID com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const transportadoraMock = {
        id: 1,
        Nome: "Transportadora 1",
        SituacaoTransportadora: 1,
      };

      transportadoraModel.getTransportadoraById.mockResolvedValue(
        transportadoraMock
      );

      await transportadoraController.getTransportadoraById(req, res);

      expect(transportadoraModel.getTransportadoraById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(transportadoraMock);
    });

    it("deve retornar uma mensagem se a transportadora estiver inativa", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const transportadoraMock = {
        id: 1,
        Nome: "Transportadora 1",
        SituacaoTransportadora: 0,
      };

      transportadoraModel.getTransportadoraById.mockResolvedValue(
        transportadoraMock
      );

      await transportadoraController.getTransportadoraById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Transportadora está inativa.",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar a transportadora", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar transportadora");

      transportadoraModel.getTransportadoraById.mockRejectedValue(errorMock);

      await transportadoraController.getTransportadoraById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao buscar transportadora: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função adicionarTransportadoraPublic
  describe("adicionarTransportadoraPublic", () => {
    it("deve adicionar uma nova transportadora com sucesso", async () => {
      const req = {
        body: {
          nomeEmpresa: "Empresa Y",
          nomeFantasia: "Fantasia Y",
          cnpj: "123456789",
          userId: 1,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const novaTransportadoraMock = { CodigoTransportadora: 200 };

      transportadoraModel.addTransportadora.mockResolvedValue(
        novaTransportadoraMock
      );

      await transportadoraController.adicionarTransportadoraPublic(req, res);

      expect(transportadoraModel.addTransportadora).toHaveBeenCalledWith(
        req.body,
        req.body.userId
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora adicionada com sucesso",
        transportadora: novaTransportadoraMock,
      });
    });

    it("deve retornar erro 400 se campos obrigatórios estiverem ausentes", async () => {
      const req = { body: { nomeEmpresa: "Empresa Y" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await transportadoraController.adicionarTransportadoraPublic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Campos obrigatórios ausentes",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao adicionar transportadora publicamente", async () => {
      const req = {
        body: {
          nomeEmpresa: "Empresa Y",
          nomeFantasia: "Fantasia Y",
          cnpj: "123456789",
          userId: 1,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao adicionar transportadora");

      transportadoraModel.addTransportadora.mockRejectedValue(errorMock);

      await transportadoraController.adicionarTransportadoraPublic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao adicionar transportadora: ${errorMock.message}`,
      });
    });
  });
});
