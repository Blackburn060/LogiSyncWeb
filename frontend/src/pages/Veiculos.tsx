import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getVeiculos, addVeiculo, updateVeiculo, deleteVeiculo } from '../services/veiculoService';
import { Veiculo } from '../models/Veiculo';
import Navbar from '../components/Navbar';
import VeiculoForm from '../components/VeiculoForm';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

Modal.setAppElement('#root');

const Veiculos: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [veiculoToDelete, setVeiculoToDelete] = useState<Veiculo | null>(null);
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVeiculos = async () => {
      setIsLoading(true);
      if (token) {
        try {
          const veiculosData = await getVeiculos(token);
          setVeiculos(veiculosData.filter(v => v.CodigoUsuario === Number(user?.id) && v.SituacaoVeiculo !== 0));
        } catch (error) {
          console.error('Erro ao buscar veículos', error);
        }
      }
      setIsLoading(false);
    };

    fetchVeiculos();
  }, [token, user]);

  const handleAddVeiculo = async (veiculo: Omit<Veiculo, 'CodigoVeiculo'>) => {
    if (token) {
      try {
        const newVeiculo = { ...veiculo, CodigoUsuario: Number(user?.id) };
        await addVeiculo(token, newVeiculo);
        const updatedVeiculos = await getVeiculos(token);
        setVeiculos(updatedVeiculos.filter(v => v.CodigoUsuario === Number(user?.id) && v.SituacaoVeiculo !== 0));
        setShowForm(false);
        toast.success('Veículo adicionado com sucesso!');
      } catch (error) {
        console.error('Erro ao adicionar veículo', error);
        toast.error('Erro ao adicionar veículo');
      }
    }
  };

  const handleUpdateVeiculo = async (veiculo: Veiculo) => {
    if (token && veiculo.CodigoVeiculo) {
      try {
        await updateVeiculo(token, veiculo.CodigoVeiculo, veiculo);
        const updatedVeiculos = await getVeiculos(token);
        setVeiculos(updatedVeiculos.filter(v => v.CodigoUsuario === Number(user?.id) && v.SituacaoVeiculo !== 0));
        setShowForm(false);
        toast.success('Veículo atualizado com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar veículo', error);
        toast.error('Erro ao atualizar veículo');
      }
    }
  };

  const handleDeleteVeiculo = async () => {
    if (token && veiculoToDelete) {
      try {
        await deleteVeiculo(token, veiculoToDelete.CodigoVeiculo!);
        setVeiculos(prevVeiculos => prevVeiculos.filter(v => v.CodigoVeiculo !== veiculoToDelete.CodigoVeiculo));
        setShowConfirmDelete(false);
        toast.success('Veículo deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar veículo', error);
        toast.error('Erro ao deletar veículo');
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

  const openConfirmDeleteModal = (veiculo: Veiculo) => {
    setVeiculoToDelete(veiculo);
    setShowConfirmDelete(true);
  };

  const closeConfirmDeleteModal = () => {
    setVeiculoToDelete(null);
    setShowConfirmDelete(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center p-4 pt-10">
        <div className="w-full max-w-md bg-logisync-color-blue-400 p-6 rounded-lg relative">
          <h1 className="text-2xl font-bold mb-4 text-center text-white shadow-md bg-logisync-color-blue-50 p-2 rounded">Veículos</h1>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <l-helix size="45" speed="2.5" color="white"></l-helix>
            </div>
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-lg text-white mb-4">Nenhum veículo encontrado.</p>
              <button
                className="px-4 py-2 bg-logisync-color-blue-50 text-white rounded shadow-md hover:bg-logisync-color-blue-200 transition duration-300"
                onClick={() => {
                  setSelectedVeiculo({ NomeVeiculo: '', CodigoUsuario: Number(user?.id) });
                  setShowForm(true);
                }}
              >
                Adicionar Novo Veículo
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-2 max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                {veiculos.map(veiculo => (
                  <li key={veiculo.CodigoVeiculo} className="flex items-center justify-between mb-2 bg-white p-2 rounded shadow-sm">
                    <span className="flex-grow mr-2 truncate">{veiculo.NomeVeiculo}</span>
                    <div className="flex-shrink-0">
                      <button
                        className="text-blue-700 mr-2"
                        onClick={() => {
                          setSelectedVeiculo(veiculo);
                          setShowForm(true);
                        }}
                      >
                        <FaEdit className="mr-2" />
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => openConfirmDeleteModal(veiculo)}
                      >
                        <FaTrash className="mr-2" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-left">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded shadow-md hover:bg-green-600 transition duration-300"
                  onClick={() => {
                    setSelectedVeiculo({ NomeVeiculo: '', CodigoUsuario: Number(user?.id) });
                    setShowForm(true);
                  }}
                >
                  Novo
                </button>
              </div>
            </>
          )}
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
      <Modal
        isOpen={showConfirmDelete}
        onRequestClose={closeConfirmDeleteModal}
        contentLabel="Confirmar Exclusão"
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-4">Confirmação</h2>
          <p className="mb-4">Você tem certeza que deseja excluir o veículo <strong>{veiculoToDelete?.NomeVeiculo}</strong>?</p>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
              onClick={closeConfirmDeleteModal}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={handleDeleteVeiculo}
            >
              Excluir
            </button>
          </div>
        </div>
      </Modal>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Veiculos;