import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getHomeLink = () => {
    if (user) {
      if (user.tipousuario === 'motorista') {
        navigate('/calendario');
      } else {
        navigate('/gestao/home');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-logisync-color-blue-100">403</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Você não tem permissão para acessar esta página.</h1>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button onClick={getHomeLink} className="rounded-md bg-logisync-color-blue-50 px-3.5 py-2.5 text-lg font-semibold text-white shadow-sm hover:bg-logisync-color-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logisync-color-blue-400">
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
