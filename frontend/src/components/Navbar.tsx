import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import logo from '../assets/images/Logo-LogiSync-02-SF.webp';
import iconeMenu from '../assets/icons/Icone-barra-de-menu.webp';
import { FaCalendarAlt, FaTruck, FaBuilding, FaClock, FaChevronDown, FaUsers, FaBoxOpen, FaSeedling, FaCog, FaHome, FaChartLine } from 'react-icons/fa';

interface NavbarProps {
  showLogin?: boolean;
  showRegister?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showLogin = true, showRegister = true }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
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

  const isActive = (path: string) => location.pathname === path;

  type PermissionPages = keyof typeof permissions;

  const permissions = {
    //Externo
    calendario: ['motorista', 'gerente', 'administrador'],
    agendamentos: ['motorista', 'gerente', 'administrador'],
    veiculos: ['motorista', 'gerente', 'administrador'],
    transportadora: ['motorista', 'gerente', 'administrador'],

    //Interno
    autorizarAgendamentos: ['administrador', 'gerente'],
    portaria: ['administrador', 'gerente', 'portaria'],
    patio: ['administrador', 'gerente', 'portaria', 'patio'],
    relatorios: ['administrador', 'gerente'],
    configuracoes: ['administrador', 'gerente'],
    usuarios: ['administrador'],
    produtos: ['administrador'],
    horarios: ['administrador', 'gerente'],
    safra: ['administrador']
  };

  const renderNavLinks = () => {
    if (!user) return null;

    const hasPermission = (page: PermissionPages) => {
      return permissions[page]?.includes(user.tipousuario);
    };

    const linkClass = (isActive: boolean, isDisabled: boolean) =>
      `flex items-center px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition duration-300 
        ${isActive ? 'bg-logisync-color-blue-50 text-gray-800 shadow-md' : 'hover:bg-gray-200 hover:text-gray-800'} 
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`;

    if (user?.tipousuario === 'motorista') {
      return (
        <>
          <Link to="/calendario" className={`flex items-center px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition duration-300 ${isActive('/calendario') ? 'bg-logisync-color-blue-50 text-gray-800 shadow-md' : 'hover:bg-gray-200 hover:text-gray-800'}`}>
            <FaCalendarAlt className="mr-1 md:mr-2" /> Calendário
          </Link>
          <Link to="/agendamentos" className={`flex items-center px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition duration-300 ${isActive('/agendamentos') ? 'bg-logisync-color-blue-50 text-gray-800 shadow-md' : 'hover:bg-gray-200 hover:text-gray-800'}`}>
            <FaClock className="mr-1 md:mr-2" /> Agendamentos
          </Link>
          <Link to="/veiculos" className={`flex items-center px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition duration-300 ${isActive('/veiculos') ? 'bg-logisync-color-blue-50 text-gray-800 shadow-md' : 'hover:bg-gray-200 hover:text-gray-800'}`}>
            <FaTruck className="mr-1 md:mr-2" /> Veículos
          </Link>
          <Link to="/transportadora" className={`flex items-center px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition duration-300 ${isActive('/transportadora') ? 'bg-logisync-color-blue-50 text-gray-800 shadow-md' : 'hover:bg-gray-200 hover:text-gray-800'}`}>
            <FaBuilding className="mr-1 md:mr-2" /> Transportadora
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/gestao/home" className={`flex items-center px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition duration-300 ${isActive('/gestao/home') ? 'bg-logisync-color-blue-50 text-gray-800 shadow-md' : 'hover:bg-gray-200 hover:text-gray-800'}`}>
            <FaHome className="mr-1 md:mr-2" /> Início
          </Link>

          <Link
            to={hasPermission('agendamentos') ? "/gestao/autorizarAgendamentos" : "#"}
            className={linkClass(isActive('/gestao/autorizarAgendamentos'), !hasPermission('agendamentos'))}
          >
            <FaClock className="mr-1 md:mr-2" /> Agendamentos
          </Link>

          <Link to={hasPermission('portaria') ? "/gestao/portaria" : "#"} className={linkClass(isActive('/gestao/portaria'), !hasPermission('portaria'))}>
            <FaBuilding className="mr-1 md:mr-2" /> Portaria
          </Link>

          <Link to={hasPermission('patio') ? "/gestao/patio" : "#"} className={linkClass(isActive('/gestao/patio'), !hasPermission('patio'))}>
            <FaTruck className="mr-1 md:mr-2" /> Gestão de Pátio
          </Link>

          <Link to={hasPermission('relatorios') ? "/gestao/relatorios" : "#"} className={linkClass(isActive('/gestao/relatorios'), !hasPermission('relatorios'))}>
            <FaChartLine className="mr-1 md:mr-2" /> Relatórios
          </Link>

          <div
            onClick={hasPermission('configuracoes') ? toggleDropdown : undefined}
            className={`relative ${hasPermission('configuracoes') ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
          >
            <div className="hover:text-gray-300 flex items-center">
              <FaCog className="mr-1 md:mr-2" /> Configurações{' '}
              <FaChevronDown
                className={`ml-2 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </div>

            {/* Dropdown items */}
            <div
              className={`absolute mt-2 py-2 w-40 bg-logisync-color-blue-300 rounded-lg shadow-xl z-20 ${isDropdownOpen && hasPermission('configuracoes') ? 'block' : 'hidden'
                }`}
            >
              <Link
                to={hasPermission('usuarios') ? '/gestao/usuarios' : '#'}
                className={linkClass(isActive('/gestao/usuarios'), !hasPermission('usuarios'))}
              >
                <FaUsers className="mr-1 md:mr-2" /> Usuários
              </Link>
              <Link
                to={hasPermission('produtos') ? '/gestao/produtos' : '#'}
                className={linkClass(isActive('/gestao/produtos'), !hasPermission('produtos'))}
              >
                <FaBoxOpen className="mr-1 md:mr-2" /> Produtos
              </Link>
              <Link
                to={hasPermission('horarios') ? '/gestao/horarios' : '#'}
                className={linkClass(isActive('/gestao/horarios'), !hasPermission('horarios'))}
              >
                <FaClock className="mr-1 md:mr-2" /> Horários
              </Link>
              <Link
                to={hasPermission('safra') ? '/gestao/safra' : '#'}
                className={linkClass(isActive('/gestao/safra'), !hasPermission('safra'))}
              >
                <FaSeedling className="mr-1 md:mr-2" /> Safra
              </Link>
            </div>
          </div>

        </>
      );
    }
  };

  const renderAuthLinks = () => (
    <div className="flex items-center space-x-4 md:space-x-6 text-white text-sm md:text-base font-bold">
      {showLogin && (
        <Link to="/login" className="hover:text-gray-300 flex items-center">
          Login
        </Link>
      )}
      {showRegister && (
        <Link to="/registro/usuario" className="hover:text-gray-300 flex items-center">
          Cadastrar-se
        </Link>
      )}
    </div>
  );

  return (
    <nav className="bg-logisync-color-blue-400 shadow-md w-full z-10">
      <div className="flex justify-between items-center px-2 md:px-4 py-2">
        <div className="flex items-center">
          <img
            src={iconeMenu}
            alt="Menu Icon"
            className="w-8 md:w-11 cursor-pointer min-[1410px]:hidden object-contain"
            onClick={toggleMenu}
          />
          <Link to={user?.tipousuario === 'motorista' ? "/calendario" : "/gestao/home"}>
            <img src={logo} alt="LogiSync Logo" className="w-12 md:w-16 ml-2 object-contain" />
          </Link>
          <span className="text-white font-bold text-lg md:text-xl ml-2 md:ml-4">LogiSync</span>
        </div>
        <div className="hidden min-[1410px]:flex items-center space-x-4 md:space-x-6 text-white text-sm md:text-base font-bold">
          {user ? renderNavLinks() : null}
        </div>
        <div className='flex items-center'>
          {user && (
            <div className="hidden min-[1410px]:flex items-center">
              <span className="text-white font-bold text-sm md:text-base mr-2 md:mr-3">{user.nomecompleto}</span>
            </div>
          )}
          {user ? <UserMenu logout={logout} user={user} /> : renderAuthLinks()}
        </div>
      </div>
      {/* Sidebar menu */}
      <div
        className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-20 min-[1410px]:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-56 md:w-64 h-full bg-logisync-color-blue-400 z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-4">
          <span className="text-white font-bold text-lg md:text-xl">Menu</span>
          <button onClick={toggleMenu} className="text-white text-2xl">×</button>
        </div>
        <nav className="flex flex-col p-4 space-y-2 font-bold text-sm md:text-base items-start text-white">
          {user ? renderNavLinks() : renderAuthLinks()}
        </nav>
      </div>
    </nav>
  );
};

export default Navbar;
