// src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/Logo-LogiSync-02-SF.png';
import iconeUsuario from '../assets/icons/Icon-user-white.png';
import iconeMenu from '../assets/icons/Icone-barra-de-menu.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="bg-logisync-color-blue-400 shadow-md w-full z-10">
      <div className="flex justify-between items-center px-2 py-1">
        <div className="flex items-center">
          <img
            src={iconeMenu}
            alt="Menu Icon"
            className="w-11 cursor-pointer lg:hidden"
            onClick={toggleMenu}
          />
          <img src={logo} alt="LogiSync Logo" className="w-16 ml-2" />
          <span className="text-white font-bold text-xl ml-2">LogiSync</span>
        </div>
        <div className="hidden lg:flex items-center space-x-6 text-white font-bold text-xl">
          <Link to="/calendario" className="hover:text-gray-200">Calendário</Link>
          <Link to="/agendamentos" className="hover:text-gray-200">Agendamentos</Link>
          <Link to="/veiculos" className="hover:text-gray-200">Veículos</Link>
          <Link to="/transportadora" className="hover:text-gray-200">Transportadora</Link>
          <button onClick={logout} className="hover:text-gray-200">Sair</button>
        </div>
        <div className="hidden lg:flex items-center">
          <span className="text-white font-bold text-xl mr-3">{user ? user.nomeCompleto : 'Usuário'}</span>
          <img src={iconeUsuario} alt="User Icon" className="w-11" />
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-64 h-full bg-logisync-color-blue-400 z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center p-4">
          <span className="text-white font-bold text-xl">Menu</span>
          <button onClick={toggleMenu} className="text-white text-2xl">×</button>
        </div>
        <nav className="flex flex-col p-4 space-y-2 font-bold text-xl items-start">
          <Link to="/calendario" className="text-white">Calendário</Link>
          <Link to="/agendamentos" className="text-white">Agendamentos</Link>
          <Link to="/veiculos" className="text-white">Veículos</Link>
          <Link to="/transportadora" className="text-white">Transportadora</Link>
          <button onClick={logout} className="text-white">Sair</button>
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
