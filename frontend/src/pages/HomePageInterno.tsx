import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import IconeHomePortaria from '../assets/icons/IconeHomePortaria.webp';
import { FaCalendarAlt, FaCubes, FaStopwatch, FaUser, FaUsers } from 'react-icons/fa';

const HomePageInterno: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <div className="flex-grow flex flex-col items-center p-6">
                <div className="w-full max-w-3xl">
                    <h1 className="mb-7 text-black text-4xl font-extrabold text-left">Acesso Rápido</h1>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-bold">

                        <button
                            onClick={() => handleNavigation('/agendamentos')}
                            className="bg-logisync-color-blue-400 text-white p-10 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300"
                        >
                            <FaCalendarAlt className="mb-4 size-12" />
                            <span className="text-2xl">Agendamentos</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/portaria')}
                            className="bg-logisync-color-blue-400 text-white p-10 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300"
                        >
                            <img src={IconeHomePortaria} alt="Portaria" className="mb-3 w-20 h-full object-contain" />
                            <span className="text-2xl">Portaria</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/produtos')}
                            className="bg-logisync-color-blue-400 text-white p-10 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300"
                        >
                            <FaCubes className="mb-4 size-12" />
                            <span className="text-2xl">Produtos</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/gestao/horarios')}
                            className="bg-logisync-color-blue-400 text-white p-10 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300"
                        >
                            <FaStopwatch className="mb-4 size-12" />
                            <span className="text-2xl">Horários</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/gestao/usuarios')}
                            className="bg-logisync-color-blue-400 text-white p-10 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300"
                        >
                            <FaUsers className="mb-4 size-12" />
                            <span className="text-2xl">Usuários</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/conta')}
                            className="bg-logisync-color-blue-400 text-white p-10 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300"
                        >
                            <FaUser className="mb-4 size-12" />
                            <span className="text-2xl">Conta</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageInterno;
