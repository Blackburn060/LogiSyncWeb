import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-6xl font-extrabold text-logisync-color-blue-100">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Página não encontrada</h1>
        <p className="mt-6 text-base leading-7 text-gray-600">Desculpe, não conseguimos encontrar a página que você está procurando.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/" className="rounded-md bg-logisync-color-blue-50 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-logisync-color-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logisync-color-blue-400">
            Voltar para a página inicial
          </Link>
          <Link to="/contact" className="text-sm font-semibold text-gray-900">
            Contatar suporte <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
