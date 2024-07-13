import React from 'react';
import logo from '../assets/images/Logo-LogiSync-02-SF.png';  // Importa a imagem do logo
import profilePic from '../assets/icons/Icon-user-white.png';  // Use a imagem disponível

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-logisync-color-blue-300 p-4 font-bold">
      <div className="flex items-center space-x-2">
        <img src={logo} alt="LogiSync Logo" className="w-12 h-12 rounded-full"/>
        <span className="text-white">LogiSync</span>
      </div>
      <ul className="flex space-x-4">
        <li className="text-white"><a href="/">Calendário</a></li>
        <li className="text-white"><a href="/meus-agendamentos">Agendamentos</a></li>
        <li className="text-white"><a href="/">Veículos</a></li>
        <li className="text-white"><a href="/">Transportadora</a></li>
        <li className="text-white"><a href="/">Sair</a></li>
      </ul>
      <div className="flex items-center space-x-2">
        <span className="text-white">Marcelo Tizo</span>
        <img src={profilePic} alt="User Profile" className="w-8 h-8 rounded-full"/>
      </div>
    </nav>
  );
};

export default Navbar;
