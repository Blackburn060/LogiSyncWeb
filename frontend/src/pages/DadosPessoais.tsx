import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { getUsuario } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import UpdateUserForm from '../components/UpdateUserForm';
import { Usuario } from '../models/Usuario';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DadosPessoais: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const { accessToken, user } = useAuth();

  const fetchUsuario = useCallback(async () => {
    if (accessToken && user) {
      try {
        const usuarioData = await getUsuario(accessToken, Number(user.id));
        setUsuario(usuarioData);
      } catch (error) {
        console.error('Erro ao buscar detalhes do usuário', error);
      }
    }
  }, [accessToken, user]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleUpdate = () => {
    fetchUsuario();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <ToastContainer />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-lg bg-blue-700 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Dados Pessoais</h1>
          {usuario && accessToken && (
            <UpdateUserForm userData={usuario} accessToken={accessToken} onUpdate={handleUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DadosPessoais;
