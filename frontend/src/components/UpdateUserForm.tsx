import React, { useState } from 'react';
import { Usuario } from '../models/Usuario';
import { updateUsuario } from '../services/usuarioService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UpdateUserFormProps {
  userData: Usuario;
  accessToken: string;
  onUpdate: () => void;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({ userData, accessToken, onUpdate }) => {
  const [formData, setFormData] = useState<Usuario>({
    ...userData,
    CPF: userData.CPF || '', // Garantir que o CPF seja uma string vazia se estiver ausente
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      if (!validateCPF(formData.CPF)) {
        toast.error('CPF inválido!');
        return;
      }

      try {
        await updateUsuario(accessToken, formData.CodigoUsuario, formData);
        onUpdate();
        setIsEditing(false);
        toast.success('Dados atualizados com sucesso!', {
          onClose: () => window.location.reload()
        });
      } catch (error) {
        console.error('Erro ao atualizar usuário', error);
        toast.error('Erro ao atualizar usuário.', {
          onClose: () => window.location.reload()
        });
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="NomeCompleto">Nome Completo</label>
          <input
            type="text"
            id="NomeCompleto"
            name="NomeCompleto"
            value={formData.NomeCompleto}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="Email">Email</label>
          <input
            type="email"
            id="Email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="CPF">CPF</label>
          <input
            type="text"
            id="CPF"
            name="CPF"
            value={formData.CPF}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="NumeroCelular">Número Celular</label>
          <input
            type="text"
            id="NumeroCelular"
            name="NumeroCelular"
            value={formData.NumeroCelular || ''}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="text-left">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {isEditing ? 'Atualizar' : 'Editar'}
          </button>
        </div>
      </form>
    </>
  );
};

export default UpdateUserForm;
