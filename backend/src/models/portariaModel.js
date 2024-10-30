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
        portaria.DataHoraSaida || null, 
        portaria.UsuarioAprovacao, 
        portaria.ObservacaoPortaria || '', 
        portaria.MotivoRecusa || null // Adiciona o MotivoRecusa
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID); // Retorna o ID do registro recém-criado
        }
      });
    });
  };
  
// Atualizar dados da portaria
const updatePortaria = (codigoAgendamento, { DataHoraSaida, MotivoRecusa }) => {
    return new Promise((resolve, reject) => {
      // Inicializa um array de atualizações e valores para construir a query dinamicamente
      const updates = [];
      const values = [];
  
      // Se DataHoraSaida for fornecida, adiciona à lista de atualizações
      if (DataHoraSaida) {
        updates.push("DataHoraSaida = ?");
        values.push(DataHoraSaida);
      }
  
      // Se MotivoRecusa for fornecida, adiciona à lista de atualizações
      if (MotivoRecusa) {
        updates.push("MotivoRecusa = ?");
        values.push(MotivoRecusa);
      }
  
      // Se nenhum campo foi passado para atualizar, rejeita a promessa
      if (updates.length === 0) {
        return reject(new Error("Nenhum campo para atualizar."));
      }
  
      // Adiciona o CodigoAgendamento para a cláusula WHERE
      values.push(codigoAgendamento);
  
      // Monta a query dinâmica com base nos campos fornecidos
      const sql = `
        UPDATE dadosportaria
        SET ${updates.join(", ")}
        WHERE CodigoAgendamento = ?
      `;
  
      // Executa a query no banco de dados
      db.run(sql, values, function(err) {
        if (err) {
          console.error("Erro ao atualizar dados da portaria:", err);
          reject(err);
        } else {
          resolve(this.changes);  // Retorna o número de linhas afetadas
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
