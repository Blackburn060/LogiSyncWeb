const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'LogiSync.db');

let db = null;

// Só abre a conexão com o banco de dados se não for o ambiente de teste
if (process.env.NODE_ENV !== 'test') {
    db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error('Erro ao abrir o banco de dados: ', err.message);
        } else {
            console.log('Conexão com o banco de dados estabelecida com sucesso.');
        }
    });
} else {
    // No ambiente de teste, fornecemos um mock de db para evitar erros
    db = {
        all: jest.fn(),
        run: jest.fn(),
        get: jest.fn(),
    };
}

module.exports = db;
