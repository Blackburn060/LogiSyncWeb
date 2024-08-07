import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getTransportadora, updateTransportadora, deleteTransportadora, addTransportadora, updateUserTransportadora } from '../services/transportadoraService';
import { useAuth } from '../context/AuthContext';
import { Transportadora } from '../models/Transportadora';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegistroTransportadora: React.FC = () => {
  const [transportadora, setTransportadora] = useState<Transportadora | null>(null);
  const { accessToken, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Transportadora>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchTransportadora = async () => {
      setIsLoading(true);
      if (accessToken && user?.CodigoTransportadora) {
        try {
          console.log('Fetching transportadora for CodigoTransportadora:', user.CodigoTransportadora);
          const transportadoraData = await getTransportadora(accessToken, user.CodigoTransportadora);
          console.log('Fetched transportadora:', transportadoraData);
          setTransportadora(transportadoraData);
          setFormData(transportadoraData);
        } catch (error) {
          console.error('Erro ao buscar detalhes da transportadora', error);
        }
      } else {
        console.log('accessToken or CodigoTransportadora is missing');
      }
      setIsLoading(false);
    };

    fetchTransportadora();
  }, [accessToken, user]);

  const handleUpdate = async () => {
    if (isEditing && formData && transportadora) {
      try {
        await updateTransportadora(accessToken as string, transportadora.CodigoTransportadora, formData);
        setIsEditing(false);
        setTransportadora(formData as Transportadora);
        toast.success('Transportadora atualizada com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar transportadora', error);
        toast.error('Erro ao atualizar transportadora.');
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDelete = async () => {
    if (accessToken && transportadora) {
      try {
        await deleteTransportadora(accessToken as string, transportadora.CodigoTransportadora);
        toast.success('Transportadora inativada com sucesso!', {
          onClose: () => window.location.reload(),
        });
      } catch (error) {
        console.error('Erro ao inativar transportadora', error);
        toast.error('Erro ao inativar transportadora.');
      }
    }
  };

  const handleAddTransportadora = async () => {
    if (!user) {
      toast.error('Usuário não está autenticado');
      return;
    }
    
    try {
      const newTransportadora = await addTransportadora(accessToken as string, formData as Transportadora);
      await updateUserTransportadora(accessToken as string, Number(user.id), newTransportadora.CodigoTransportadora);
      toast.success('Transportadora adicionada com sucesso!', {
        onClose: () => window.location.reload(),
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao adicionar transportadora', error);
      toast.error('Erro ao adicionar transportadora.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <ToastContainer />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-lg bg-blue-700 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Dados da Transportadora</h1>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <>
              {transportadora ? (
                <form>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="Nome">Nome da Empresa</label>
                    <input
                      type="text"
                      id="Nome"
                      name="Nome"
                      value={formData.Nome || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200' : ''}`}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="NomeFantasia">Nome Fantasia</label>
                    <input
                      type="text"
                      id="NomeFantasia"
                      name="NomeFantasia"
                      value={formData.NomeFantasia || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200' : ''}`}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="CNPJ">CNPJ</label>
                    <input
                      type="text"
                      id="CNPJ"
                      name="CNPJ"
                      value={formData.CNPJ || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200' : ''}`}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-500 text-white rounded"
                      onClick={handleUpdate}
                    >
                      {isEditing ? 'Salvar' : 'Editar'}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white rounded"
                      onClick={isEditing ? () => setIsEditing(false) : handleDelete}
                    >
                      {isEditing ? 'Cancelar' : 'Excluir Transportadora'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {showAddForm ? (
                    <form>
                      <div className="mb-4">
                        <label className="block text-white mb-2" htmlFor="Nome">Nome da Empresa</label>
                        <input
                          type="text"
                          id="Nome"
                          name="Nome"
                          value={formData.Nome || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-white mb-2" htmlFor="NomeFantasia">Nome Fantasia</label>
                        <input
                          type="text"
                          id="NomeFantasia"
                          name="NomeFantasia"
                          value={formData.NomeFantasia || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-white mb-2" htmlFor="CNPJ">CNPJ</label>
                        <input
                          type="text"
                          id="CNPJ"
                          name="CNPJ"
                          value={formData.CNPJ || ''}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex justify-between">
                        <button
                          type="button"
                          className="px-4 py-2 bg-green-500 text-white rounded"
                          onClick={handleAddTransportadora}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-red-500 text-white rounded"
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        onClick={() => setShowAddForm(true)}
                      >
                        Adicionar Nova Transportadora
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroTransportadora;
