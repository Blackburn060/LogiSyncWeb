import React, { useEffect, useState } from 'react';
import CalendarComponent from '../components/CalendarComponent';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const AgendamentosPage: React.FC = () => {
  const { user, accessToken, refreshToken, refreshAccessToken } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user || !accessToken) {
        if (refreshToken) {
          try {
            await refreshAccessToken();
          } catch (err) {
            setAuthChecked(true);
            return;
          }
        } else {
          setAuthChecked(true);
          return;
        }
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [user, accessToken, refreshToken, refreshAccessToken]);

  const tipoAgendamento = localStorage.getItem('TipoAgendamento');
  if (!tipoAgendamento) {
    return <Navigate to="/processo" />;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <Toaster position="top-right" />
        <div className="flex flex-grow justify-center items-center">
          <l-helix size="45" speed="2.5" color="black"></l-helix>
        </div>
      </div>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <Toaster position="top-right" />
      <div className="container mx-auto pt-10 flex-grow">
        {/* Remova ou comente a linha abaixo para remover o título duplicado */}
        {/* <h1 className="text-2xl font-extrabold mb-6">Agendar Horário</h1> */}
        <CalendarComponent />
      </div>
    </div>
  );
};

export default AgendamentosPage;
