const express = require('express');
const userRoutes = require('./routes/userRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes'); 
const safraRoutes = require('./routes/safraRoutes'); 
const transportadoraRoutes = require('./routes/transportadoraRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes'); 
const portariaRoutes = require('./routes/portariaRoutes'); 
const agendamentoRoutes = require('./routes/agendamentoRoutes'); 

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
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
