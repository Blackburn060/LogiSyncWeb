const db = require('../Config/database');

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

// Função para verificar se um horário específico está agendado em uma data específica
const isHorarioAgendado = (horarioIntervalo, data) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT COUNT(*) as count
            FROM agendamentos
            WHERE DataAgendamento = ? AND HoraAgendamento = ?
        `;
        db.get(sql, [data, horarioIntervalo], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.count > 0);
            }
        });
    });
};

// Função para buscar horários disponíveis em uma data específica
const getHorariosDisponiveisPorData = (data) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT * FROM cadastroHorarios LIMIT 1';
        db.get(sql, [], async (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    const horarios = generateHorarios(row.horarioInicio, row.horarioFim, row.intervaloHorario);
                    
                    for (let horario of horarios) {
                        const horarioIntervalo = `${horario.horarioInicio} - ${horario.horarioFim}`;
                        const agendado = await isHorarioAgendado(horarioIntervalo, data);
                        horario.agendado = agendado;
                    }

                    resolve(horarios);
                } else {
                    resolve([]);
                }
            }
        });
    });
};

// Função para atualizar o intervalo de um horário
const updateIntervaloHorario = (id, intervaloHorario) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE cadastroHorarios SET intervaloHorario = ?, dataAtualizacao = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(sql, [intervaloHorario, id], function (err) {
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
    getHorariosDisponiveisPorData,
    updateIntervaloHorario,
};
