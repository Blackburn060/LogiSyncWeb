import React from 'react';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-blue-500 p-4">
      <div className="text-white font-bold">LogiSync</div>
      <ul className="flex space-x-4">
        <li className="text-white">Calendário</li>
        <li className="text-white">Agendamentos</li>
        <li className="text-white">Veículos</li>
        <li className="text-white">Transportadora</li>
        <li className="text-white">Sair</li>
      </ul>
      <div className="flex items-center space-x-2">
        <span className="text-white">Marcelo Tizo</span>
        <img src="/path/to/profile-pic.png" alt="User Profile" className="w-8 h-8 rounded-full"/>
      </div>
    </nav>
  );
};

export default Navbar;
