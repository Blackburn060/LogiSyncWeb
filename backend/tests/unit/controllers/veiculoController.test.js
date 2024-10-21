const veiculoController = require("../../../src/Controllers/veiculoController");
const veiculoModel = require("../../../src/models/veiculoModel");

// Mock do veiculoModel
jest.mock("../../../src/models/veiculoModel");
beforeAll(() => {
  // Suprimir logs de erro
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  // Restaurar comportamento original
  console.error.mockRestore();
});

describe("VeiculoController", () => {
  // Teste para a função listarVeiculos
  describe("listarVeiculos", () => {
    it("deve retornar uma lista de veículos com sucesso", async () => {
      const req = { user: { id: 1 } };
      const res = { json: jest.fn() };
      const veiculosMock = [
        { id: 1, nomeVeiculo: "Veículo 1" },
        { id: 2, nomeVeiculo: "Veículo 2" },
      ];

      veiculoModel.getAllVeiculos.mockResolvedValue(veiculosMock);

      await veiculoController.listarVeiculos(req, res);

      expect(veiculoModel.getAllVeiculos).toHaveBeenCalledWith({
        CodigoUsuario: req.user.id,
      });
      expect(res.json).toHaveBeenCalledWith(veiculosMock);
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar veículos", async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar veículos");

      veiculoModel.getAllVeiculos.mockRejectedValue(errorMock);

      await veiculoController.listarVeiculos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao buscar veículos: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função obterVeiculoPorId
  describe("obterVeiculoPorId", () => {
    it("deve retornar um veículo pelo ID com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const veiculoMock = [{ id: 1, nomeVeiculo: "Veículo 1" }];

      veiculoModel.getAllVeiculos.mockResolvedValue(veiculoMock);

      await veiculoController.obterVeiculoPorId(req, res);

      expect(veiculoModel.getAllVeiculos).toHaveBeenCalledWith({
        CodigoVeiculo: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(veiculoMock[0]);
    });

    it("deve retornar erro 404 se o veículo não for encontrado", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      veiculoModel.getAllVeiculos.mockResolvedValue([]);

      await veiculoController.obterVeiculoPorId(req, res);

      expect(veiculoModel.getAllVeiculos).toHaveBeenCalledWith({
        CodigoVeiculo: 1,
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Veículo não encontrado",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar o veículo", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar veículo");

      veiculoModel.getAllVeiculos.mockRejectedValue(errorMock);

      await veiculoController.obterVeiculoPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao buscar veículo: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função adicionarVeiculo
  describe("adicionarVeiculo", () => {
    it("deve adicionar um novo veículo com sucesso", async () => {
      const req = {
        body: { nomeVeiculo: "Veículo Novo", placa: "ABC-1234" },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const veiculoIdMock = 1;

      veiculoModel.addVeiculo.mockResolvedValue(veiculoIdMock);

      await veiculoController.adicionarVeiculo(req, res);

      expect(veiculoModel.addVeiculo).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        id: veiculoIdMock,
        message: "Veículo adicionado com sucesso",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao adicionar veículo", async () => {
      const req = { body: { nomeVeiculo: "Veículo Novo", placa: "ABC-1234" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao adicionar veículo");

      veiculoModel.addVeiculo.mockRejectedValue(errorMock);

      await veiculoController.adicionarVeiculo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao adicionar veículo: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função atualizarVeiculo
  describe("atualizarVeiculo", () => {
    it("deve atualizar um veículo com sucesso", async () => {
      const req = {
        params: { id: 1 },
        body: { nomeVeiculo: "Veículo Atualizado" },
      };
      const res = { send: jest.fn() };
      const updatedMock = 1;

      veiculoModel.updateVeiculo.mockResolvedValue(updatedMock);

      await veiculoController.atualizarVeiculo(req, res);

      expect(veiculoModel.updateVeiculo).toHaveBeenCalledWith(req.body, 1);
      expect(res.send).toHaveBeenCalledWith({
        message: "Veículo atualizado com sucesso.",
      });
    });

    it("deve retornar erro 404 se o veículo não for encontrado para atualização", async () => {
      const req = {
        params: { id: 1 },
        body: { nomeVeiculo: "Veículo Atualizado" },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const updatedMock = 0;

      veiculoModel.updateVeiculo.mockResolvedValue(updatedMock);

      await veiculoController.atualizarVeiculo(req, res);

      expect(veiculoModel.updateVeiculo).toHaveBeenCalledWith(req.body, 1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Veículo não encontrado.",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao atualizar o veículo", async () => {
      const req = {
        params: { id: 1 },
        body: { nomeVeiculo: "Veículo Atualizado" },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao atualizar veículo");

      veiculoModel.updateVeiculo.mockRejectedValue(errorMock);

      await veiculoController.atualizarVeiculo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao atualizar veículo: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função deletarVeiculo
  describe("deletarVeiculo", () => {
    it("deve inativar um veículo com sucesso", async () => {
      const req = { params: { id: 1 } };
      const res = { send: jest.fn() };
      const changesMock = 1;

      veiculoModel.deleteVeiculo.mockResolvedValue(changesMock);

      await veiculoController.deletarVeiculo(req, res);

      expect(veiculoModel.deleteVeiculo).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({
        message: "Veículo inativado com sucesso",
      });
    });

    it("deve retornar erro 404 se o veículo não for encontrado para exclusão", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const changesMock = 0;

      veiculoModel.deleteVeiculo.mockResolvedValue(changesMock);

      await veiculoController.deletarVeiculo(req, res);

      expect(veiculoModel.deleteVeiculo).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Veículo não encontrado",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao inativar o veículo", async () => {
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao inativar veículo");

      veiculoModel.deleteVeiculo.mockRejectedValue(errorMock);

      await veiculoController.deletarVeiculo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao inativar veículo: ${errorMock.message}`,
      });
    });
  });

  // Teste para a função adicionarVeiculoPublic
  describe("adicionarVeiculoPublic", () => {
    it("deve adicionar um novo veículo publicamente com sucesso", async () => {
      const req = {
        body: {
          CodigoUsuario: 1,
          nomeVeiculo: "Veículo Público",
          placa: "ABC-1234",
          marca: "Marca X",
          modeloTipo: "SUV",
          anoFabricacao: 2020,
          cor: "Azul",
          capacidadeCarga: 1000,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const veiculoIdMock = 2;

      veiculoModel.addVeiculo.mockResolvedValue(veiculoIdMock);

      await veiculoController.adicionarVeiculoPublic(req, res);

      expect(veiculoModel.addVeiculo).toHaveBeenCalledWith({
        CodigoUsuario: 1,
        nomeVeiculo: "Veículo Público",
        placa: "ABC-1234",
        marca: "Marca X",
        modeloTipo: "SUV",
        anoFabricacao: 2020,
        cor: "Azul",
        capacidadeCarga: 1000,
        Bloqueado: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        id: veiculoIdMock,
        message: "Veículo adicionado com sucesso",
      });
    });

    it("deve retornar erro 400 se campos obrigatórios estiverem ausentes", async () => {
      const req = { body: { nomeVeiculo: "Veículo Público" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await veiculoController.adicionarVeiculoPublic(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Campos obrigatórios ausentes",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao adicionar veículo publicamente", async () => {
      const req = {
        body: {
          CodigoUsuario: 1,
          nomeVeiculo: "Veículo Público",
          placa: "ABC-1234",
          marca: "Marca X",
          modeloTipo: "SUV",
          anoFabricacao: 2020,
          cor: "Azul",
          capacidadeCarga: 1000,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao adicionar veículo");

      veiculoModel.addVeiculo.mockRejectedValue(errorMock);

      await veiculoController.adicionarVeiculoPublic(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: `Erro ao adicionar veículo: ${errorMock.message}`,
      });
    });
  });
});
