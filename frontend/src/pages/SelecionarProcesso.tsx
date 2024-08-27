import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/Logo-LogiSync-Horizontal-02-SF.webp';
import { FaDollyFlatbed, FaTruckLoading, FaTruckPickup } from 'react-icons/fa';

const SelectProcess: React.FC = () => {
  const navigate = useNavigate();

  const handleSelection = (tipo: string) => {
    localStorage.setItem('TipoAgendamento', tipo);
    navigate('/calendario');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-logisync-color-blue-400">
      <img src={logo} alt="LogiSync Logo" className="w-56 mb-10" />
      
      <h2 className="text-white text-2xl font-extrabold mb-8 bg-logisync-color-blue-200 p-3 rounded-lg">SELECIONE UM PROCESSO</h2>
      
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <button
          onClick={() => handleSelection('carga')}
          className="bg-logisync-color-blue-200 text-white text-2xl font-extrabold py-4 px-10 mb-4 w-full rounded-lg hover:bg-logisync-color-blue-50 flex items-center justify-center"
        >
          <FaTruckLoading className="mr-4 size-12" />
          CARGA
        </button>

        <button
          onClick={() => handleSelection('descarga')}
          className="bg-green-600 text-white text-2xl font-extrabold py-4 px-10 w-full rounded-lg hover:bg-green-400 flex items-center justify-center"
        >
          <FaDollyFlatbed className="mr-4 size-12" />
          DESCARGA
        </button>
      </div>
    </div>
  );
};

export default SelectProcess;