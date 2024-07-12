import React from "react";
import logoLogiSync from "../assets/images/Logo-LogiSync-02-SF.png";
import iconeUsuario from "../assets/icons/Icon-user-white.png";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-logisync-color-blue-300 p-2 font-bold">
      <div className="flex items-center space-x-2">
        <img src={logoLogiSync} alt="Logo LogiSync" className="w-16 h-16 rounded-full" />
        <span className="text-white">LogiSync</span>
      </div>
      <ul className="flex space-x-4">
        <li className="text-white">Calendário</li>
        <li className="text-white">Agendamentos</li>
        <li className="text-white">Veículos</li>
        <li className="text-white">Transportadora</li>
        <li className="text-white">Sair</li>
      </ul>
      <div className="flex items-center space-x-2">
        <span className="text-white">Marcelo Tizo</span>
        <img
          src={iconeUsuario}
          alt="User icon"
          className="w-16 h-16 rounded-full"
        />
      </div>
    </nav>
  );
};

export default Navbar;
