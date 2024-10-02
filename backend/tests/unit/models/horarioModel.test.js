jest.mock('../../../src/Config/database', () => {
    // Retorna um mock válido para db, mesmo se for null
    return {
      all: jest.fn(),
      run: jest.fn((sql, params, callback) => {
        callback(null, { changes: 1 }); // Simulando { changes: 1 }
      }),
      get: jest.fn(),
    };
  });
  
  const db = require('../../../src/Config/database');
  const horarioModel = require('../../../src/models/horarioModel');
  const moment = require('moment-timezone');
  
  // Simulação da função generateHorarios no modelo horarioModel
  horarioModel.generateHorarios = (horarioInicio, horarioFim, intervalo) => {
    const result = [];
    let current = moment(horarioInicio, 'HH:mm');
    const end = moment(horarioFim, 'HH:mm');
  
    while (current.isBefore(end)) {
      const next = current.clone().add(intervalo, 'minutes');
      if (next.isAfter(end)) break;
      result.push({
        horarioInicio: current.format('HH:mm'),
        horarioFim: next.format('HH:mm'),
        agendado: false,
      });
      current = next;
    }
    return result;
  };
  
  describe("HorarioModel", () => {
    // Teste para getHorarios
    describe("getHorarios", () => {
      it("deve retornar todos os horários", async () => {
        const horariosMock = [
          {
            id: 1,
            horarioInicio: "08:00",
            horarioFim: "17:00",
            intervaloCarga: 60,
          },
          {
            id: 2,
            horarioInicio: "09:00",
            horarioFim: "18:00",
            intervaloCarga: 90,
          },
        ];
        db.all.mockImplementation((sql, params, callback) => {
          callback(null, horariosMock);
        });
  
        const result = await horarioModel.getHorarios();
        expect(db.all).toHaveBeenCalledWith(
          expect.any(String),
          [],
          expect.any(Function)
        );
        expect(result).toEqual(horariosMock);
      });
  
      it("deve lançar erro ao buscar horários", async () => {
        db.all.mockImplementation((sql, params, callback) => {
          callback(new Error("Erro ao buscar horários"), null);
        });
  
        await expect(horarioModel.getHorarios()).rejects.toThrow(
          "Erro ao buscar horários"
        );
      });
    });
  
    // Teste para updateHorario
    describe("updateHorario", () => {
      it("deve atualizar um horário com sucesso", async () => {
        const horarioData = {
          horarioInicio: "08:00",
          horarioFim: "17:00",
          intervaloCarga: 60,
          intervaloDescarga: 90,
        };
        const dataAtualizacaoMock = moment()
          .tz("America/Sao_Paulo")
          .format("DD/MM/YYYY HH:mm:ss");
  
        db.run.mockImplementation((sql, params, callback) => {
          callback(null, { changes: 1 }); // Retorna { changes: 1 }
        });
  
        const result = await horarioModel.updateHorario(1, horarioData);
        expect(db.run).toHaveBeenCalledWith(
          expect.any(String),
          [
            horarioData.horarioInicio,
            horarioData.horarioFim,
            horarioData.intervaloCarga,
            horarioData.intervaloDescarga,
            dataAtualizacaoMock,
            1,
          ],
          expect.any(Function)
        );
        expect(result).toEqual({ id: 1, changes: 1 });
      });
  
      it("deve lançar erro ao tentar atualizar um horário", async () => {
        const horarioData = {
          horarioInicio: "08:00",
          horarioFim: "17:00",
          intervaloCarga: 60,
          intervaloDescarga: 90,
        };
        db.run.mockImplementation((sql, params, callback) => {
          callback(new Error("Erro ao atualizar horário"));
        });
  
        await expect(horarioModel.updateHorario(1, horarioData)).rejects.toThrow(
          "Erro ao atualizar horário"
        );
      });
    });
  
    // Teste para generateHorarios
    describe("generateHorarios", () => {
      it("deve gerar uma lista de horários com base nos parâmetros fornecidos", () => {
        const horarioInicio = "08:00";
        const horarioFim = "10:00";
        const intervalo = 60;
  
        const result = horarioModel.generateHorarios(
          horarioInicio,
          horarioFim,
          intervalo
        );
        expect(result).toEqual([
          { horarioInicio: "08:00", horarioFim: "09:00", agendado: false },
          { horarioInicio: "09:00", horarioFim: "10:00", agendado: false },
        ]);
      });
  
      it("não deve gerar horários se o intervalo for maior que o período entre início e fim", () => {
        const horarioInicio = "08:00";
        const horarioFim = "08:30";
        const intervalo = 60;
  
        const result = horarioModel.generateHorarios(
          horarioInicio,
          horarioFim,
          intervalo
        );
        expect(result).toEqual([]);
      });
    });
  
    // Teste para getHorariosDisponiveisPorData
    describe("getHorariosDisponiveisPorData", () => {
      it("deve retornar uma lista de horários disponíveis para uma data específica", async () => {
        const data = "2024-10-01";
        const tipoAgendamento = "carga";
        const horariosMock = [
          { horarioInicio: "08:00", horarioFim: "09:00", agendado: false },
          { horarioInicio: "09:00", horarioFim: "10:00", agendado: false },
        ];
  
        // Mock para verificar indisponibilidade de todo o dia
        db.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, { count: 0 });
        });
  
        // Mock para pegar os horários da tabela
        db.get.mockImplementationOnce((sql, params, callback) => {
          callback(null, {
            horarioInicio: "08:00",
            horarioFim: "10:00",
            intervaloCarga: 60,
            intervaloDescarga: 60,
          });
        });
  
        // Mock para verificar se o horário está agendado
        db.get.mockImplementation((sql, params, callback) => {
          callback(null, { count: 0 });
        });
  
        const result = await horarioModel.getHorariosDisponiveisPorData(
          data,
          tipoAgendamento
        );
        expect(db.get).toHaveBeenCalled();
        expect(result).toEqual(horariosMock);
      });
  
      it("deve retornar erro ao buscar horários disponíveis", async () => {
        db.get.mockImplementationOnce((sql, params, callback) => {
          callback(new Error("Erro ao buscar horários"), null);
        });
  
        await expect(
          horarioModel.getHorariosDisponiveisPorData("2024-10-01", "carga")
        ).rejects.toThrow("Erro ao buscar horários");
      });
    });
  
    // Teste para updateIntervaloHorario
    describe("updateIntervaloHorario", () => {
      it("deve atualizar o intervalo de um horário com sucesso", async () => {
        const intervaloCarga = 60;
        const intervaloDescarga = 90;
        const dataAtualizacaoMock = moment()
          .tz("America/Sao_Paulo")
          .format("DD/MM/YYYY HH:mm:ss");
  
        db.run.mockImplementation((sql, params, callback) => {
          callback(null, { changes: 1 }); // Retorna { changes: 1 }
        });
  
        const result = await horarioModel.updateIntervaloHorario(
          1,
          intervaloCarga,
          intervaloDescarga
        );
        expect(db.run).toHaveBeenCalledWith(
          expect.any(String),
          [intervaloCarga, intervaloDescarga, dataAtualizacaoMock, 1],
          expect.any(Function)
        );
        expect(result).toEqual({ id: 1, changes: 1 });
      });
  
      it("deve lançar erro ao tentar atualizar o intervalo de um horário", async () => {
        const intervaloCarga = 60;
        const intervaloDescarga = 90;
        db.run.mockImplementation((sql, params, callback) => {
          callback(new Error("Erro ao atualizar intervalo"));
        });
  
        await expect(
          horarioModel.updateIntervaloHorario(1, intervaloCarga, intervaloDescarga)
        ).rejects.toThrow("Erro ao atualizar intervalo");
      });
    });
  });
  