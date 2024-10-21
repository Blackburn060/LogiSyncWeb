const HorarioController = require("../../../src/Controllers/horarioController");
const HorarioModel = require("../../../src/models/horarioModel");

// Mock do HorarioModel
jest.mock("../../../src/models/horarioModel");

describe("HorarioController", () => {
    
  beforeAll(() => {
    // Mock do console.error para suprimir os logs de erro durante os testes
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restaura o comportamento original do console.error
    console.error.mockRestore();
  });
  // Testes para a função getHorarios
  describe("getHorarios", () => {
    it("deve retornar todos os horários com sucesso", async () => {
      const req = {};
      const res = { json: jest.fn() };
      const horariosMock = [
        { id: 1, horarioInicio: "08:00", horarioFim: "12:00" },
      ];

      HorarioModel.getHorarios.mockResolvedValue(horariosMock);

      await HorarioController.getHorarios(req, res);

      expect(HorarioModel.getHorarios).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(horariosMock);
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar horários", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar horários");

      HorarioModel.getHorarios.mockRejectedValue(errorMock);

      await HorarioController.getHorarios(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Erro ao buscar horários.",
      });
    });
  });

  // Testes para a função getHorariosDisponiveisPorData
  describe("getHorariosDisponiveisPorData", () => {
    it("deve retornar erro 400 se a data ou tipo de agendamento não forem fornecidos", async () => {
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await HorarioController.getHorariosDisponiveisPorData(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Data e tipo de agendamento são obrigatórios.",
      });
    });

    it("deve retornar horários disponíveis para a data e tipo de agendamento fornecidos", async () => {
      const req = { query: { data: "2023-10-01", TipoAgendamento: "Carga" } };
      const res = { json: jest.fn() };
      const horariosDisponiveisMock = [
        { id: 1, horarioInicio: "08:00", horarioFim: "10:00" },
      ];

      HorarioModel.getHorariosDisponiveisPorData.mockResolvedValue(
        horariosDisponiveisMock
      );

      await HorarioController.getHorariosDisponiveisPorData(req, res);

      expect(HorarioModel.getHorariosDisponiveisPorData).toHaveBeenCalledWith(
        "2023-10-01",
        "Carga"
      );
      expect(res.json).toHaveBeenCalledWith(horariosDisponiveisMock);
    });

    it("deve retornar erro 500 se ocorrer um erro ao buscar horários disponíveis", async () => {
      const req = { query: { data: "2023-10-01", TipoAgendamento: "Carga" } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao buscar horários disponíveis");

      HorarioModel.getHorariosDisponiveisPorData.mockRejectedValue(errorMock);

      await HorarioController.getHorariosDisponiveisPorData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Erro ao buscar horários disponíveis.",
      });
    });
  });

  // Testes para a função updateHorario
  describe("updateHorario", () => {
    it("deve retornar erro 400 se todos os campos não forem fornecidos", async () => {
      const req = {
        params: { id: 1 },
        body: { horarioInicio: "08:00", horarioFim: "12:00" },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await HorarioController.updateHorario(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Todos os campos são obrigatórios.",
      });
    });

    it("deve atualizar o horário com sucesso", async () => {
      const req = {
        params: { id: 1 },
        body: {
          horarioInicio: "08:00",
          horarioFim: "12:00",
          intervaloCarga: 30,
          intervaloDescarga: 45,
        },
      };
      const res = { send: jest.fn() };
      const resultMock = { changes: 1 };

      HorarioModel.updateHorario.mockResolvedValue(resultMock);

      await HorarioController.updateHorario(req, res);

      expect(HorarioModel.updateHorario).toHaveBeenCalledWith(1, {
        horarioInicio: "08:00",
        horarioFim: "12:00",
        intervaloCarga: 30,
        intervaloDescarga: 45,
      });
      expect(res.send).toHaveBeenCalledWith({
        message: "Horário atualizado com sucesso.",
        details: resultMock,
      });
    });

    it("deve retornar erro 404 se o horário não for encontrado", async () => {
      const req = {
        params: { id: 1 },
        body: {
          horarioInicio: "08:00",
          horarioFim: "12:00",
          intervaloCarga: 30,
          intervaloDescarga: 45,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const resultMock = { changes: 0 };

      HorarioModel.updateHorario.mockResolvedValue(resultMock);

      await HorarioController.updateHorario(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Horário não encontrado.",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro ao atualizar o horário", async () => {
      const req = {
        params: { id: 1 },
        body: {
          horarioInicio: "08:00",
          horarioFim: "12:00",
          intervaloCarga: 30,
          intervaloDescarga: 45,
        },
      };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const errorMock = new Error("Erro ao atualizar horário");

      HorarioModel.updateHorario.mockRejectedValue(errorMock);

      await HorarioController.updateHorario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Erro ao atualizar horário.",
      });
    });
  });
});
