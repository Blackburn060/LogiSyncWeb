const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const safraRoutes = require('./routes/safraRoutes');
const transportadoraRoutes = require('./routes/transportadoraRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const portariaRoutes = require('./routes/portariaRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure o CORS
app.use(cors({
    origin: 'https://logisync-frontend.azurewebsites.net',
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use(express.json());

// Middleware para adicionar cabeçalhos CORS manualmente
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://logisync-frontend.azurewebsites.net');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use('/api', userRoutes);
app.use('/api', horarioRoutes);
app.use('/api', produtoRoutes);
app.use('/api', safraRoutes);
app.use('/api', transportadoraRoutes);
app.use('/api', veiculoRoutes);
app.use('/api', portariaRoutes);
app.use('/api', agendamentoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = db;
