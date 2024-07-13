import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './index.css';  // Importa o arquivo CSS principal

const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MeusAgendamentos = lazy(() => import('./pages/MeusAgendamentos'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
