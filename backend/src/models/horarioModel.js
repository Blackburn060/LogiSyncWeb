const db = require('../Config/database');
const moment = require('moment-timezone');

// Função para buscar todos os horários
const getHorarios = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastroHorarios';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Função para atualizar um horário completo
const updateHorario = (id, { horarioInicio, horarioFim, intervaloCarga, intervaloDescarga }) => {
    return new Promise((resolve, reject) => {
        const dataAtualizacao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const sql = `
            UPDATE cadastroHorarios
            SET horarioInicio = ?, horarioFim = ?, intervaloCarga = ?, intervaloDescarga = ?, dataAtualizacao = ?
            WHERE id = ?
        `;
        db.run(sql, [horarioInicio, horarioFim, intervaloCarga, intervaloDescarga, dataAtualizacao, id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id, changes: this.changes });
            }
        });
    });
};

// Função para gerar horários disponíveis entre horarioInicio e horarioFim com o intervalo dado
const generateHorarios = (horarioInicio, horarioFim, intervalo) => {
    const horarios = [];
    let current = new Date(`1970-01-01T${horarioInicio}:00`);
    const end = new Date(`1970-01-01T${horarioFim}:00`);

    while (current < end) {
        const next = new Date(current.getTime() + intervalo * 60000);
        if (next > end) break;
        horarios.push({
            horarioInicio: current.toTimeString().substring(0, 5),
            horarioFim: next.toTimeString().substring(0, 5),
            agendado: false,
        });
        current = next;
    }

    return horarios;
};

// Função para verificar se um dia está indisponível para todo o dia
const isDiaTodoIndisponivel = (data, tipoAgendamento) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM agendamentos
            WHERE DataAgendamento = ? AND DiaTodo = 1 AND TipoAgendamento = ?
        `;
        db.get(sql, [data, tipoAgendamento], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    });
};

// Função para verificar se um horário específico está agendado em uma data específica
const isHorarioAgendado = (horarioIntervalo, data, tipoAgendamento) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM agendamentos
            WHERE DataAgendamento = ?
            AND (HoraAgendamento = ? OR DiaTodo = 1)
            AND TipoAgendamento = ?
            AND SituacaoAgendamento != 'Cancelado'  -- Ignora agendamentos cancelados
        `;
        db.get(sql, [data, horarioIntervalo, tipoAgendamento], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    });
};

// Função para buscar horários disponíveis em uma data específica, com base no tipo de agendamento
const getHorariosDisponiveisPorData = (data, tipoAgendamento) => {
    return new Promise(async (resolve, reject) => {
        try {
            const diaTodoIndisponivel = await isDiaTodoIndisponivel(data, tipoAgendamento);
            if (diaTodoIndisponivel) {
                return resolve([]); 
            }

            const sql = 'SELECT * FROM cadastroHorarios LIMIT 1';
            db.get(sql, [], async (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        const intervalo = tipoAgendamento === 'carga' ? row.intervaloCarga : row.intervaloDescarga;
                        const horarios = generateHorarios(row.horarioInicio, row.horarioFim, intervalo);

                        for (let horario of horarios) {
                            const horarioIntervalo = `${horario.horarioInicio} - ${horario.horarioFim}`;
                            const agendado = await isHorarioAgendado(horarioIntervalo, data, tipoAgendamento);
                            horario.agendado = agendado; 
                        }

                        resolve(horarios);
                    } else {
                        resolve([]);
                    }
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Função para atualizar o intervalo de um horário
const updateIntervaloHorario = (id, intervaloCarga, intervaloDescarga) => {
    return new Promise((resolve, reject) => {
        const dataAtualizacao = moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss');
        const sql = `UPDATE cadastroHorarios SET intervaloCarga = ?, intervaloDescarga = ?, dataAtualizacao = ? WHERE id = ?`;
        db.run(sql, [intervaloCarga, intervaloDescarga, dataAtualizacao, id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id, changes: this.changes });
            }
        });
    });
};

module.exports = {
    getHorarios,
    updateHorario,
    getHorariosDisponiveisPorData,
    updateIntervaloHorario,
};
