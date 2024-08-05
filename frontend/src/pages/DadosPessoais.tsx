import React, { useEffect, useState } from 'react';
import { getUsuario } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Usuario } from '../models/Usuario';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure();

const DadosPessoais: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const { accessToken, user } = useAuth();

  useEffect(() => {
    const fetchUsuario = async () => {
      if (accessToken && user) {
        try {
          const usuarioData = await getUsuario(accessToken, Number(user.id));
          setUsuario(usuarioData);
        } catch (error) {
          console.error('Erro ao buscar detalhes do usuário', error);
          toast.error('Erro ao buscar detalhes do usuário');
        }
      }
    };

    fetchUsuario();
  }, [accessToken, user]);

  if (!usuario) {
    return <div>Carregando...</div>;
  }

  const handleUpdate = () => {
    // Implementar a lógica de atualização
    toast.success('Dados atualizados com sucesso');
  };

  const handleDelete = () => {
    // Implementar a lógica de exclusão
    toast.success('Conta excluída com sucesso');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-blue-700 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Dados Pessoais</h1>
          <form>
            <div className="mb-4">
              <label className="block text-white mb-1">Nome Completo</label>
              <input type="text" value={usuario.NomeCompleto} className="w-full p-2 rounded" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-1">CPF</label>
              <input type="text" value={usuario.CPF} className="w-full p-2 rounded" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-1">Celular</label>
              <input type="text" value={usuario.Celular} className="w-full p-2 rounded" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-1">E-mail</label>
              <input type="email" value={usuario.Email} className="w-full p-2 rounded" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-1">Senha</label>
              <input type="password" value={usuario.Senha} className="w-full p-2 rounded" readOnly />
            </div>
            <div className="flex justify-between">
              <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpdate}>
                Atualizar
              </button>
              <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDelete}>
                Excluir conta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DadosPessoais;
