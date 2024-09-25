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
import CalendarioAgendamentos from './pages/CalendarioAgendamentos';
import DadosTransportadora from './pages/Transportadora';
import GerenciarSafras from './pages/GerenciarSafras';
import HomePageInterno from './pages/HomePageInterno';
import SelecionarProcesso from './pages/SelecionarProcesso';
import AutorizarAgendamentos from './pages/AutorizarAgendamentos';
import Portaria from './pages/portaria';
import ProtectedRoute from './components/ProtectedRoute';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas que não exigem autenticação */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/processo" element={<SelecionarProcesso />} />
          <Route path="/calendario" element={<CalendarioAgendamentos />} />
          <Route path="/registro/veiculo" element={<RegistroVeiculo />} />
          <Route path="/registro/usuario" element={<RegistroUsuario />} />
          <Route path="/registro/transportadora" element={<RegistroTransportadora />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

          {/* Rotas que exigem autenticação usando ProtectedRoute */}
          <Route path="/agendamentos" element={<ProtectedRoute><MeusAgendamentos /></ProtectedRoute>} />
          <Route path="/veiculos" element={<ProtectedRoute><Veiculos /></ProtectedRoute>} />
          <Route path="/conta" element={<ProtectedRoute><DadosPessoais /></ProtectedRoute>} />
          <Route path="/transportadora" element={<ProtectedRoute><DadosTransportadora /></ProtectedRoute>} />
          <Route path="/gestao/home" element={<ProtectedRoute><HomePageInterno /></ProtectedRoute>} />
          <Route path="/gestao/autorizarAgendamentos" element={<ProtectedRoute><AutorizarAgendamentos /></ProtectedRoute>} />
          <Route path="/gestao/horarios" element={<ProtectedRoute><GerenciarHorarios /></ProtectedRoute>} />
          <Route path="/gestao/safra" element={<ProtectedRoute><GerenciarSafras /></ProtectedRoute>} />
          <Route path="/gestao/portaria" element={<ProtectedRoute><Portaria /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;