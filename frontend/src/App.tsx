import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import MeusAgendamentos from './pages/MeusAgendamentos';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import RegistroVeiculo from './pages/RegistroVeiculo';
import RegistroUsuario from './pages/RegistroUsuario';
import RegistroTransportadora from './pages/RegistroTransportadora';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/agendamentos" element={<MeusAgendamentos />} />
          <Route path="/registro-veiculo" element={<RegistroVeiculo />} />
          <Route path="/registro-usuario" element={<RegistroUsuario />} />
          <Route path="/registro-transportadora" element={<RegistroTransportadora />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;