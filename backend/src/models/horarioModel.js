// src/models/horarioModel.js
const db = require('../Config/database');

// Função para buscar todos os horários
const getHorarios = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM cadastrohorarios';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Função para adicionar um único conjunto de horários
const addHorarios = (horario) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO cadastrohorarios (horario_inicial, horario_final, seg_status, ter_status, qua_status, qui_status, sex_status, sab_status, dom_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(sql, [
            horario.horarioInicial,
            horario.horarioFinal,
            horario.seg_status,
            horario.ter_status,
            horario.qua_status,
            horario.qui_status,
            horario.sex_status,
            horario.sab_status,
            horario.dom_status
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Função para atualizar a disponibilidade de um horário
const updateDayStatus = (id, day, status) => {
    return new Promise((resolve, reject) => {
        // Validação de 'day' para garantir que é um dia válido
        const validDays = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
        if (!validDays.includes(day)) {
            console.error('Erro: Dia inválido fornecido:', day);
            reject(new Error('Invalid day parameter'));
            return; // Encerra a função para evitar mais execução
        }

        const sql = `UPDATE cadastrohorarios SET ${day}_status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?`;

        // Executando a consulta SQL
        db.run(sql, [status, id], function(err) {
            if (err) {
                // Log detalhado do erro incluindo os valores usados na consulta
                console.error("Erro ao executar SQL:", sql, "Com valores:", status, id, err);
                reject(err);
            } else {
                if (this.changes === 0) {
                    // Log se nenhuma linha foi atualizada
                    console.error("Nenhuma linha atualizada, verifique o ID:", id);
                    reject(new Error("No rows updated"));
                } else {
                    resolve({ id, changes: this.changes });
                }
            }
        });
    });
};

module.exports = {
    getHorarios,
    addHorarios,
    updateDayStatus
};
