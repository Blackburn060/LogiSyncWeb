import React, { useState, useEffect } from 'react';
import { getVeiculos, addVeiculo, updateVeiculo, deleteVeiculo } from '../services/veiculoService';
import { Veiculo } from '../models/Veiculo';
import Navbar from '../components/Navbar';
import VeiculoForm from '../components/VeiculoForm';
import { useAuth } from '../context/AuthContext';

const Veiculos: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { accessToken, user } = useAuth();

  useEffect(() => {
    const fetchVeiculos = async () => {
      if (accessToken) {
        try {
          const veiculosData = await getVeiculos(accessToken);
          setVeiculos(veiculosData.filter(v => v.CodigoUsuario === Number(user?.id) && v.SituacaoVeiculo !== 0));
        } catch (error) {
          console.error('Erro ao buscar veículos', error);
        }
      }
    };

    fetchVeiculos();
  }, [accessToken, user]);

  const handleAddVeiculo = async (veiculo: Omit<Veiculo, 'CodigoVeiculo'>) => {
    if (accessToken) {
      try {
        const newVeiculo = { ...veiculo, CodigoUsuario: Number(user?.id) };
        await addVeiculo(accessToken, newVeiculo);
        const updatedVeiculos = await getVeiculos(accessToken);
        setVeiculos(updatedVeiculos.filter(v => v.CodigoUsuario === Number(user?.id) && v.SituacaoVeiculo !== 0));
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao adicionar veículo', error);
      }
    }
  };

  const handleUpdateVeiculo = async (veiculo: Veiculo) => {
    if (accessToken && veiculo.CodigoVeiculo) {
      try {
        await updateVeiculo(accessToken, veiculo.CodigoVeiculo, veiculo);
        const updatedVeiculos = await getVeiculos(accessToken);
        setVeiculos(updatedVeiculos.filter(v => v.CodigoUsuario === Number(user?.id) && v.SituacaoVeiculo !== 0));
        setShowForm(false);
      } catch (error) {
        console.error('Erro ao atualizar veículo', error);
      }
    }
  };

  const handleDeleteVeiculo = async (id: number) => {
    if (accessToken) {
      try {
        console.log(`Tentando deletar veículo com ID: ${id}`);
        await deleteVeiculo(accessToken, id);
        setVeiculos(prevVeiculos => prevVeiculos.filter(v => v.CodigoVeiculo !== id));
        console.log('Veículo deletado com sucesso');
      } catch (error) {
        console.error('Erro ao deletar veículo', error);
      }
    }
  };

  const handleSave = async (veiculo: Partial<Veiculo>) => {
    if (veiculo.CodigoVeiculo) {
      await handleUpdateVeiculo(veiculo as Veiculo);
    } else {
      await handleAddVeiculo(veiculo as Omit<Veiculo, 'CodigoVeiculo'>);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-blue-700 p-6 rounded-lg relative">
          <h1 className="text-2xl font-bold mb-4 text-center text-white bg-blue-800 p-2 rounded">Veículos</h1>
          <ul className="space-y-2">
            {veiculos.map(veiculo => (
              <li key={veiculo.CodigoVeiculo} className="flex items-center justify-between mb-2 bg-white p-2 rounded">
                <span className="flex-grow mr-2 truncate">{veiculo.NomeVeiculo}</span>
                <div className="flex-shrink-0">
                  <button
                    className="text-yellow-500 mr-2"
                    onClick={() => {
                      setSelectedVeiculo(veiculo);
                      setShowForm(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteVeiculo(veiculo.CodigoVeiculo!)}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-left">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => {
                setSelectedVeiculo({ NomeVeiculo: '', CodigoUsuario: Number(user?.id) });
                setShowForm(true);
              }}
            >
              Novo
            </button>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
            <VeiculoForm
              veiculo={selectedVeiculo!}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Veiculos;
