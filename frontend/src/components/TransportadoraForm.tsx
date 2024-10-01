import React, { useState, useEffect } from 'react';
import { Transportadora } from '../models/Transportadora';
import { updateTransportadora, getTransportadora, addTransportadora } from '../services/transportadoraService';
import toast, { Toaster } from 'react-hot-toast';

interface UpdateTransportadoraFormProps {
  transportadoraData?: Transportadora;
  token: string;
  onUpdate: () => void;
}

const UpdateTransportadoraForm: React.FC<UpdateTransportadoraFormProps> = ({ transportadoraData, token, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<Transportadora>>(transportadoraData || {});
  const [isEditing, setIsEditing] = useState(!!transportadoraData);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (transportadoraData) {
      const fetchTransportadora = async () => {
        const transportadora = await getTransportadora(token, transportadoraData.CodigoTransportadora);
        if (!transportadora || transportadora.SituacaoTransportadora === 0) {
          toast.error('Transportadora inativa ou não encontrada.');
        } else {
          setFormData(transportadora);
        }
      };
      fetchTransportadora();
    }
  }, [token, transportadoraData]);

  // Função para validar o formulário
  const isValidForm = () => {
    const { Nome, NomeFantasia, CNPJ } = formData;
    if (!Nome || !Nome.trim()) {
      toast.error('O campo Nome é obrigatório.');
      return false;
    }
    if (!NomeFantasia || !NomeFantasia.trim()) {
      toast.error('O campo Nome Fantasia é obrigatório.');
      return false;
    }
    if (!CNPJ || !CNPJ.trim()) {
      toast.error('O campo CNPJ é obrigatório.');
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valida o formulário antes de submeter
    if (!isValidForm()) return;

    try {
      if (transportadoraData) {
        // Atualizando uma transportadora existente
        await updateTransportadora(token, transportadoraData.CodigoTransportadora, formData);
        toast.success('Transportadora atualizada com sucesso!');
      } else {
        // Adicionando uma nova transportadora
        const response = await addTransportadora(token, formData);

        const novoToken = response.token; // Acessa o token retornado

        // Atualiza o token no localStorage, se for retornado
        if (novoToken) {
          localStorage.setItem('token', novoToken); // Atualiza o token no armazenamento local
        }

        toast.success('Transportadora adicionada com sucesso!');
      }

      onUpdate(); // Atualiza a tela após adicionar ou atualizar
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao salvar transportadora.');
    }
  };

  // Função que é chamada quando o botão Editar é clicado
  const handleEdit = () => {
    toast('Não é possível alterar o CNPJ.', {
      icon: '⚠️',
      duration: 3000, // O tempo que o toast ficará visível
    });
    setIsEditing(true);
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
            value={formData.Nome || ''}
            onChange={handleChange}
            disabled={!isEditing && !!transportadoraData}
            className={`w-full p-2 border ${isEditing || !transportadoraData ? 'border-gray-300' : 'border-gray-400 bg-gray-200'} rounded`}
            required
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
            disabled={!isEditing && !!transportadoraData}
            className={`w-full p-2 border ${isEditing || !transportadoraData ? 'border-gray-300' : 'border-gray-400 bg-gray-200'} rounded`}
            required
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
            disabled={!!transportadoraData} // Desabilita a edição do CNPJ se a transportadora já estiver cadastrada
            className={`w-full p-2 border ${transportadoraData ? 'border-gray-400 bg-gray-200' : 'border-gray-300'} rounded`}
            required
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleEdit}  // Chama handleEdit ao clicar no botão Editar
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {transportadoraData ? (isEditing ? 'Salvar' : 'Editar') : 'Adicionar Transportadora'}
          </button>
          {transportadoraData && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              {isEditing ? 'Cancelar' : 'Excluir Transportadora'}
            </button>
          )}
        </div>
      </form>

      {showModal && transportadoraData && (
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
