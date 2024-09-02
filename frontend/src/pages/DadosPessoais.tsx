import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { getUsuario } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import UpdateUserForm from '../components/UpdateUserForm';
import { Usuario } from '../models/Usuario';

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
      <div className="flex-grow flex flex-col items-center p-4 pt-10">
        <div className="w-full max-w-lg bg-blue-700 p-6 rounded-lg relative">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">
            <span className="bg-blue-900 px-2 py-1 rounded">Dados Pessoais</span>
          </h1>
          {usuario && accessToken && (
            <UpdateUserForm userData={usuario} accessToken={accessToken} onUpdate={handleUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DadosPessoais;
