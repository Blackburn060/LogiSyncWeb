import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserAlt, FaCog, FaSignOutAlt } from 'react-icons/fa';
import iconeUsuario from '../assets/icons/Icon-user-white.webp';

interface User {
    nomeCompleto: string;
}

interface UserMenuProps {
    logout: () => void;
    user: User | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ logout, user }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}><img
            src={iconeUsuario}
            alt="User Icon"
            className="w-11 h-11 cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={toggleMenu}
        />
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    {user && (
                        <div className="px-4 py-2 text-gray-800">
                            {user.nomeCompleto}
                        </div>
                    )}
                    <Link to="/conta"
                        className="px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white flex items-center transition-colors duration-300"><FaUserAlt className="mr-2" /> Minha Conta
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-gray-800 hover:bg-red-500 hover:text-white flex items-center transition-colors duration-300"><FaSignOutAlt className="mr-2" /> Sair
                    </button>
                    <div className="px-4 py-2 text-gray-800 italic">
                        Version: Alpha 1.5.34
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;