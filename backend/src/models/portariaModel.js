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

// Buscar portaria por CódigoAgendamento
const getPortariaByCodigoAgendamento = (CodigoAgendamento) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM dadosportaria WHERE CodigoAgendamento = ?';
        db.get(sql, [CodigoAgendamento], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Adicionar novos dados de portaria
const addPortaria = (portaria) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO dadosportaria 
            (CodigoAgendamento, DataHoraEntrada, DataHoraSaida, UsuarioAprovacao, ObservacaoPortaria, MotivoRecusa) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
            portaria.CodigoAgendamento, 
            portaria.DataHoraEntrada, 
            portaria.DataHoraSaida, 
            portaria.UsuarioAprovacao, 
            portaria.ObservacaoPortaria, 
            portaria.MotivoRecusa
        ], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Atualizar dados da portaria
// Atualizar dados da portaria
const updatePortaria = (codigoAgendamento, dataHoraSaida) => {
    return new Promise((resolve, reject) => {
      console.log("Atualizando DataHoraSaida no Model:", dataHoraSaida);  // Verifica se a data está sendo passada
  
      const sql = `
        UPDATE dadosportaria
        SET DataHoraSaida = ?
        WHERE CodigoAgendamento = ?
      `;
  
      db.run(sql, [dataHoraSaida, codigoAgendamento], function(err) {
        if (err) {
          console.error("Erro ao atualizar a DataHoraSaida no banco de dados:", err);
          reject(err);
        } else {
          console.log("Linhas atualizadas:", this.changes);
          resolve(this.changes);
        }
      });
    });
  };    

// Deletar dados da portaria
const deletePortaria = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM dadosportaria WHERE CodigoPortaria = ?';
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes); // Retorna o número de linhas afetadas
            }
        });
    });
};

module.exports = {
    getAllPortarias,
    addPortaria,
    getPortariaByCodigoAgendamento,
    updatePortaria,
    deletePortaria
};
