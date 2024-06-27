const db = require('../Config/database');

// Buscar todos os dados da portaria
const getAllPortarias = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM dadosportaria';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Adicionar novos dados de portaria
const addPortaria = (portaria) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO dadosportaria (CodigoAgendamento, DataHoraEntrada, DataHoraSaida, UsuarioAprovacao, ObservacaoPortaria, MotivoRecusa) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(sql, [portaria.CodigoAgendamento, portaria.DataHoraEntrada, portaria.DataHoraSaida, portaria.UsuarioAprovacao, portaria.ObservacaoPortaria, portaria.MotivoRecusa], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar dados da portaria
const updatePortaria = (portaria, id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE dadosportaria SET DataHoraEntrada = ?, DataHoraSaida = ?, UsuarioAprovacao = ?, ObservacaoPortaria = ?, MotivoRecusa = ? WHERE CodigoPortaria = ?`;
        db.run(sql, [portaria.DataHoraEntrada, portaria.DataHoraSaida, portaria.UsuarioAprovacao, portaria.ObservacaoPortaria, portaria.MotivoRecusa, id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

// Deletar dados da portaria
const deletePortaria = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM dadosportaria WHERE CodigoPortaria = ?';
        db.run(sql, id, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

module.exports = {
    getAllPortarias,
    addPortaria,
    updatePortaria,
    deletePortaria
};
