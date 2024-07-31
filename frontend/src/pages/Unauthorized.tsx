import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-5xl font-bold mb-4">403</h1>
      <p className="text-xl mb-8">Você não tem permissão para acessar esta página.</p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Voltar para a página inicial
      </button>
    </div>
  );
};

export default Unauthorized;
