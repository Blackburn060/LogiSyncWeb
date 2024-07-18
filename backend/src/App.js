require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes'); 
const safraRoutes = require('./routes/safraRoutes'); 
const transportadoraRoutes = require('./routes/transportadoraRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes'); 
const portariaRoutes = require('./routes/portariaRoutes'); 
const agendamentoRoutes = require('./routes/agendamentoRoutes'); 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.REACT_APP_FRONTEND_URL,
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.REACT_APP_FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', authRoutes);
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
