import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import MeusAgendamentos from './pages/MeusAgendamentos';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import RegistroVeiculo from './pages/RegistroVeiculo';
import RegistroUsuario from './pages/RegistroUsuario';
import RegistroTransportadora from './pages/RegistroTransportadora';
import Unauthorized from './pages/Unauthorized';
import GerenciarHorarios from './pages/GerenciarHorarios';
import Veiculos from './pages/Veiculos';  
import DadosPessoais from './pages/DadosPessoais'; 
<<<<<<< HEAD
import DadosTransportadora from './pages/RegistroTransportadora';
import CalendarioAgendamentos from './pages/CalendarioAgendamentos'; // Importe o componente de calendário
=======
import DadosTransportadora from './pages/Transportadora';

>>>>>>> d2c991bd3dd0ac677651e90543cb415c8b299914

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro/veiculo" element={<RegistroVeiculo />} />
          <Route path="/registro/usuario" element={<RegistroUsuario />} />
          <Route path="/registro/transportadora" element={<RegistroTransportadora />} />
          <Route path="/agendamentos" element={<MeusAgendamentos />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/conta" element={<DadosPessoais />} /> 
          <Route path="/gestao/horarios" element={<GerenciarHorarios />} />
          <Route path="/transportadora" element={<DadosTransportadora />} /> 
          <Route path="/gestao/agendamentos" element={<GerenciarHorarios />} />
          <Route path="/calendario" element={<CalendarioAgendamentos />} /> {/* Rota do Calendário */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
