import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import logo from '../assets/images/Logo-LogiSync-02-SF.webp';
import iconeMenu from '../assets/icons/Icone-barra-de-menu.webp';
import { FaCalendarAlt, FaTruck, FaBuilding, FaChartLine, FaSignOutAlt, FaClock, FaChevronDown, FaUsers, FaBoxOpen, FaSeedling, FaCog } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebarDropdown = () => {
    setIsSidebarDropdownOpen(!isSidebarDropdownOpen);
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

  const renderNavLinks = () => {
    if (user?.tipoUsuario === 'motorista') {
      return (
        <>
          <Link to="/calendario" className="hover:text-gray-300 flex items-center"><FaCalendarAlt className="mr-2" /> Calendário</Link>
          <Link to="/agendamentos" className="hover:text-gray-300 flex items-center"><FaClock className="mr-2" /> Agendamentos</Link>
          <Link to="/veiculos" className="hover:text-gray-300 flex items-center"><FaTruck className="mr-2" /> Veículos</Link>
          <Link to="/transportadora" className="hover:text-gray-300 flex items-center"><FaBuilding className="mr-2" /> Transportadora</Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/gestao/agendamentos" className="hover:text-gray-300 flex items-center"><FaCalendarAlt className="mr-2" /> Agendamentos</Link>
          <Link to="/gestao/portaria" className="hover:text-gray-300 flex items-center"><FaBuilding className="mr-2" /> Portaria</Link>
          <Link to="/gestao/patio" className="hover:text-gray-300 flex items-center"><FaTruck className="mr-2" /> Gestão de Pátio</Link>
          <Link to="/gestao/relatorios" className="hover:text-gray-300 flex items-center"><FaChartLine className="mr-2" /> Relatórios</Link>
          <div onClick={toggleDropdown} className="relative cursor-pointer">
            <div className="hover:text-gray-300 flex items-center">
              <FaCog className="mr-2" /> Configurações <FaChevronDown className={`ml-2 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className={`absolute mt-2 py-2 w-40 bg-white rounded-lg shadow-xl z-20 ${isDropdownOpen ? 'block' : 'hidden'}`}>
              <Link to="/gestao/usuarios" className="px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center"><FaUsers className="mr-2" /> Usuários</Link>
              <Link to="/gestao/produtos" className="px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center"><FaBoxOpen className="mr-2" /> Produtos</Link>
              <Link to="/gestao/horarios" className="px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center"><FaClock className="mr-2" /> Horários</Link>
              <Link to="/gestao/safra" className="px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center"><FaSeedling className="mr-2" /> Safra</Link>
            </div>
          </div>
        </>
      );
    }
  };

  const renderSidebarLinks = () => {
    if (user?.tipoUsuario === 'motorista') {
      return (
        <>
          <Link to="/calendario" className="hover:text-gray-300 flex items-center"><FaCalendarAlt className="mr-2" /> Calendário</Link>
          <Link to="/agendamentos" className="hover:text-gray-300 flex items-center"><FaClock className="mr-2" /> Agendamentos</Link>
          <Link to="/veiculos" className="hover:text-gray-300 flex items-center"><FaTruck className="mr-2" /> Veículos</Link>
          <Link to="/transportadora" className="hover:text-gray-300 flex items-center"><FaBuilding className="mr-2" /> Transportadora</Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/gestao/agendamentos" className="hover:text-gray-300 flex items-center"><FaCalendarAlt className="mr-2" /> Agendamentos</Link>
          <Link to="/gestao/portaria" className="hover:text-gray-300 flex items-center"><FaBuilding className="mr-2" /> Portaria</Link>
          <Link to="/gestao/patio" className="hover:text-gray-300 flex items-center"><FaTruck className="mr-2" /> Gestão de Pátio</Link>
          <Link to="/gestao/relatorios" className="hover:text-gray-300 flex items-center"><FaChartLine className="mr-2" /> Relatórios</Link>
          <div className="w-full">
            <div onClick={toggleSidebarDropdown} className="hover:text-gray-300 flex items-center cursor-pointer">
              <FaCog className="mr-2" /> Configurações <FaChevronDown className={`ml-2 transform transition-transform ${isSidebarDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            <div className={`ml-4 mt-2 ${isSidebarDropdownOpen ? 'block' : 'hidden'}`}>
              <Link to="/gestao/usuarios" className="block py-2 text-gray-200 hover:text-gray-400">Usuários</Link>
              <Link to="/gestao/produtos" className="block py-2 text-gray-200 hover:text-gray-400">Produtos</Link>
              <Link to="/gestao/horarios" className="block py-2 text-gray-200 hover:text-gray-400">Horários</Link>
              <Link to="/gestao/safra" className="block py-2 text-gray-200 hover:text-gray-400">Safra</Link>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <nav className="bg-logisync-color-blue-400 shadow-md w-full z-10">
      <div className="flex justify-between items-center px-2 py-1">
        <div className="flex items-center">
          <img
            src={iconeMenu}
            alt="Menu Icon"
            className="w-11 cursor-pointer min-[1400px]:hidden"
            onClick={toggleMenu}
          />
          <img src={logo} alt="LogiSync Logo" className="w-16 ml-2" />
          <span className="text-white font-bold text-xl ml-2">LogiSync</span>
        </div>
        <div className="hidden min-[1400px]:flex items-center space-x-6 text-white font-bold text-xl">
          {renderNavLinks()}
        </div>
        <div className='flex items-center'>
          <div className="hidden min-[1400px]:flex items-center">
            <span className="text-white font-bold text-xl mr-3">{user ? `Olá, ${user.nomeCompleto}` : 'Usuário'}</span>
          </div>
          <UserMenu logout={logout} user={user} />
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-20 min-[1400px]:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-64 h-full bg-logisync-color-blue-400 z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4">
          <span className="text-white font-bold text-xl">Menu</span>
          <button onClick={toggleMenu} className="text-white text-2xl">×</button>
        </div>
        <nav className="flex flex-col p-4 space-y-2 font-bold text-xl items-start text-white">
          {renderSidebarLinks()}
          {/* <button onClick={logout} className="hover:text-gray-300 flex items-center"><FaSignOutAlt className="mr-2" /> Sair</button> */}
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;