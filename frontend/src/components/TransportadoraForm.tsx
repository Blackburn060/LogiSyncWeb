import React, { useState } from 'react';
import { Transportadora } from '../models/Transportadora';
import { updateTransportadora } from '../services/transportadoraService';
import toast, { Toaster } from 'react-hot-toast';

interface UpdateTransportadoraFormProps {
  transportadoraData: Transportadora;
  accessToken: string;
  onUpdate: () => void;
}

const UpdateTransportadoraForm: React.FC<UpdateTransportadoraFormProps> = ({ transportadoraData, accessToken, onUpdate }) => {
  const [formData, setFormData] = useState<Transportadora>(transportadoraData);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      try {
        await updateTransportadora(accessToken, formData.CodigoTransportadora, formData);
        onUpdate();
        setIsEditing(false);
        toast.success('Dados atualizados com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar transportadora', error);
        toast.error('Erro ao atualizar transportadora.');
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="Nome">Nome da Empresa</label>
          <input
            type="text"
            id="Nome"
            name="Nome"
            value={formData.NomeEmpresa}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full p-2 border ${isEditing ? 'border-gray-300' : 'border-gray-400 bg-gray-200'} rounded`}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="NomeFantasia">Nome Fantasia</label>
          <input
            type="text"
            id="NomeFantasia"
            name="NomeFantasia"
            value={formData.NomeFantasia}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full p-2 border ${isEditing ? 'border-gray-300' : 'border-gray-400 bg-gray-200'} rounded`}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="CNPJ">CNPJ</label>
          <input
            type="text"
            id="CNPJ"
            name="CNPJ"
            value={formData.CNPJ}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full p-2 border ${isEditing ? 'border-gray-300' : 'border-gray-400 bg-gray-200'} rounded`}
          />
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {isEditing ? 'Salvar' : 'Editar'}
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            {isEditing ? 'Cancelar' : 'Excluir Transportadora'}
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirmação</h2>
            <p className="mb-4">Você tem certeza que deseja inativar esta transportadora?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  toast('Transportadora inativada com sucesso!', {
                    icon: '🗑️',
                  });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Inativar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateTransportadoraForm;
