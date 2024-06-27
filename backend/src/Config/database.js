const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'LogiSync.db');

let db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados: ', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    }
});

module.exports = db;
