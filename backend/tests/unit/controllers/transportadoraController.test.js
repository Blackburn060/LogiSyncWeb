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

      transportadoraModel.getAllTransportadoras.mockResolvedValue(transportadorasMock);

      await transportadoraController.listarTransportadoras(req, res);

      expect(transportadoraModel.getAllTransportadoras).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(transportadorasMock);
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar transportadoras", async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar transportadoras");

      transportadoraModel.getAllTransportadoras.mockRejectedValue(errorMock);

      await transportadoraController.listarTransportadoras(req, res);

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
        user: { id: 1, cpf: "12345678901", email: "test@example.com", nomecompleto: "Test User", numerocelular: "1234567890", tipousuario: "admin" },
        body: { Nome: "Empresa X", NomeFantasia: "Fantasia X", CNPJ: "123456789" }
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const novaTransportadoraMock = { CodigoTransportadora: 100 };

      transportadoraModel.addTransportadora.mockResolvedValue(novaTransportadoraMock);
      AuthService.generateToken.mockReturnValue("mocked-token");

      await transportadoraController.adicionarTransportadora(req, res);

      expect(AuthService.generateToken).toHaveBeenCalledWith({
        CodigoUsuario: req.user.id,
        Email: req.user.email,
        NomeCompleto: req.user.nomecompleto,
        TipoUsuario: req.user.tipousuario,
        CodigoTransportadora: novaTransportadoraMock.CodigoTransportadora,
        CPF: req.user.cpf,
        NumeroCelular: req.user.numerocelular
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: "Transportadora adicionada e usuário atualizado com sucesso",
        token: "mocked-token",
        transportadora: novaTransportadoraMock
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
      const req = { params: { id: 1 }, body: { Nome: "Nova Transportadora" }, user: { id: 1 } };
      const res = { send: jest.fn() };

      transportadoraModel.updateTransportadora.mockResolvedValue(1);

      await transportadoraController.atualizarTransportadora(req, res);

      expect(transportadoraModel.updateTransportadora).toHaveBeenCalledWith(req.body, req.params.id, req.user.id);
      expect(res.send).toHaveBeenCalledWith({ message: "Transportadora atualizada com sucesso" });
    });

    it("deve retornar erro 404 se a transportadora não for encontrada para atualização", async () => {
      const req = { params: { id: 1 }, body: { Nome: "Nova Transportadora" }, user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      transportadoraModel.updateTransportadora.mockResolvedValue(0);

      await transportadoraController.atualizarTransportadora(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: "Transportadora não encontrada" });
    });
  });

  // Teste para a função deletarTransportadora
  describe("deletarTransportadora", () => {
    it("deve deletar uma transportadora com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };

      transportadoraModel.deleteTransportadora.mockResolvedValue(1);

      await transportadoraController.deletarTransportadora(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: "Transportadora excluir com sucesso" });
    });

    it("deve retornar erro 404 se a transportadora não for encontrada", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      transportadoraModel.deleteTransportadora.mockResolvedValue(0);

      await transportadoraController.deletarTransportadora(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: "Transportadora não encontrada" });
    });
  });

  // Teste para a função getTransportadoraById
  describe("getTransportadoraById", () => {
    it("deve retornar uma transportadora pelo ID com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { json: jest.fn() };
      const transportadoraMock = { id: 1, Nome: "Transportadora 1", SituacaoTransportadora: 1 };

      transportadoraModel.getTransportadoraById.mockResolvedValue(transportadoraMock);

      await transportadoraController.getTransportadoraById(req, res);

      expect(res.json).toHaveBeenCalledWith(transportadoraMock);
    });

    it("deve retornar status 204 se a transportadora estiver inativa", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() }; 
      const transportadoraMock = {
          id: 1,
          Nome: "Transportadora 1",
          SituacaoTransportadora: 0,
      };
  
      transportadoraModel.getTransportadoraById.mockResolvedValue(transportadoraMock);
  
      await transportadoraController.getTransportadoraById(req, res);
  
      expect(res.status).toHaveBeenCalledWith(204); 
      expect(res.send).toHaveBeenCalled(); 
  });
  
  });
});
