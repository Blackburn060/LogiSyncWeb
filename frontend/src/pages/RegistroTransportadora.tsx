import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getTransportadora, updateTransportadora, deleteTransportadora } from '../services/transportadoraService';
import { useAuth } from '../context/AuthContext';
import { Transportadora } from '../models/Transportadora';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cnpj } from 'cpf-cnpj-validator';

const RegistroTransportadora: React.FC = () => {
  const [transportadora, setTransportadora] = useState<Transportadora | null>(null);
  const { accessToken, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Transportadora | null>(null);
  const [initialFormData, setInitialFormData] = useState<Transportadora | null>(null);

  useEffect(() => {
    const fetchTransportadora = async () => {
      if (accessToken && user?.CodigoTransportadora) {
        try {
          const transportadoraData = await getTransportadora(accessToken as string, user.CodigoTransportadora);
          setTransportadora(transportadoraData);
          const formattedData = {
            ...transportadoraData,
            Nome: transportadoraData.Nome || '',
            NomeFantasia: transportadoraData.NomeFantasia || '',
            CNPJ: cnpj.format(transportadoraData.CNPJ || ''),
          };
          setFormData(formattedData);
          setInitialFormData(formattedData);
        } catch (error) {
          console.error('Erro ao buscar detalhes da transportadora', error);
        }
      } else {
        console.log('accessToken or CodigoTransportadora is missing');
      }
    };

    fetchTransportadora();
  }, [accessToken, user]);

  const handleUpdate = async () => {
    if (isEditing && formData) {
      if (!cnpj.isValid(formData.CNPJ)) {
        toast.error('CNPJ inválido!');
        return;
      }

      try {
        await updateTransportadora(accessToken as string, formData.CodigoTransportadora, {
          ...formData,
          CNPJ: cnpj.format(formData.CNPJ),
        });
        setIsEditing(false);
        setTransportadora(formData);
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
      ...prevFormData!,
      [name]: name === 'CNPJ' ? cnpj.format(value) : value,
    }));
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <ToastContainer />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-lg bg-blue-700 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Dados da Transportadora</h1>
          {formData ? (
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
                  onClick={isEditing ? handleCancel : handleDelete}
                >
                  {isEditing ? 'Cancelar' : 'Excluir Transportadora'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-white">Carregando dados...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroTransportadora;
