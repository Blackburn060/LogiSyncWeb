import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getTransportadora, updateTransportadora, deleteTransportadora, addTransportadora, updateUserTransportadora } from '../services/transportadoraService';
import { useAuth } from '../context/AuthContext';
import { Transportadora } from '../models/Transportadora';
import toast, { Toaster } from 'react-hot-toast';
import { cnpj } from 'cpf-cnpj-validator';

const RegistroTransportadora: React.FC = () => {
  const [transportadora, setTransportadora] = useState<Transportadora | null>(null);
  const { token, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Transportadora>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTransportadora = async () => {
      setIsLoading(true);
      if (token && user?.codigotransportadora) {
        try {
          const transportadoraData = await getTransportadora(token, user.codigotransportadora);
          if (transportadoraData) {
            setTransportadora(transportadoraData);
            setFormData(transportadoraData);
          } else {
            setTransportadora(null);
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes da transportadora', error);
          toast.error('Erro ao buscar detalhes da transportadora.');
        }
      } else {
        setTransportadora(null);
      }
      setIsLoading(false);
    };

    fetchTransportadora();
  }, [token, user]);

  // Função para validar o formulário de transporte
  const isValidForm = () => {
    const { Nome, NomeFantasia, CNPJ } = formData;
    if (!Nome || !Nome.trim()) {
      toast.error('O campo Nome da Empresa é obrigatório.');
      return false;
    }
    if (!NomeFantasia || !NomeFantasia.trim()) {
      toast.error('O campo Nome Fantasia é obrigatório.');
      return false;
    }
    if (!CNPJ || !cnpj.isValid(CNPJ)) {
      toast.error('CNPJ inválido ou ausente.');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!isValidForm()) return;

    if (isEditing && formData && transportadora) {
      try {
        await updateTransportadora(token as string, transportadora.CodigoTransportadora, formData);
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
    if (token && transportadora) {
      try {
        await deleteTransportadora(token as string, transportadora.CodigoTransportadora);
        toast.success('Transportadora excluída com sucesso!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Erro ao inativar transportadora', error);
        toast.error('Erro ao inativar transportadora.');
      }
    }
  };

  const handleAddTransportadora = async () => {
    if (!isValidForm()) return;

    if (!user) {
      toast.error('Usuário não está autenticado');
      return;
    }

    try {
      const response = await addTransportadora(token as string, formData as Transportadora);
      const newTransportadora = response.transportadora;
      await updateUserTransportadora(token as string, Number(user.id), newTransportadora.CodigoTransportadora);
      toast.success('Transportadora adicionada com sucesso!');

      const novoToken = response.token;
      if (novoToken) {
        localStorage.setItem('token', novoToken);
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao adicionar transportadora', error);
      toast.error('Erro ao adicionar transportadora.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex-grow flex flex-col items-center p-4 pt-10">
        <div className="w-full max-w-lg bg-logisync-color-blue-400 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white shadow-md bg-logisync-color-blue-50 p-2 rounded">Dados da Transportadora</h1>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <l-helix size="45" speed="2.5" color="white"></l-helix>
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
                    <div
                      onClick={() => toast.error('Não é possível alterar o CNPJ.')}
                      className="cursor-pointer"
                    >
                      <input
                        type="text"
                        id="CNPJ"
                        name="CNPJ"
                        value={formData.CNPJ || ''}
                        onChange={handleChange}
                        disabled={!!formData.CNPJ || !!transportadora}
                        className={`w-full p-2 border ${!!formData.CNPJ || !!transportadora ? 'border-gray-400 bg-gray-200' : 'border-gray-300'} rounded`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="px-4 py-2 bg-green-600 text-white rounded"
                      onClick={handleUpdate}
                    >
                      {isEditing ? 'Salvar' : 'Editar'}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-600 text-white rounded"
                      onClick={isEditing ? () => setIsEditing(false) : () => setShowModal(true)}
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
                          className="px-4 py-2 shadow-md bg-green-600 text-white rounded"
                          onClick={handleAddTransportadora}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 shadow-md bg-red-600 text-white rounded"
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-full">
                      <p className="text-white text-center mb-4">Nenhuma transportadora vinculada a sua conta</p>
                      <button
                        className="px-4 py-2 bg-logisync-color-blue-50 text-white rounded shadow-md hover:bg-logisync-color-blue-200 transition duration-300"
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirmação</h2>
            <p className="mb-4">Você tem certeza que deseja excluir a transportadora?</p>
            <div className="flex justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-black rounded mr-2">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroTransportadora;
