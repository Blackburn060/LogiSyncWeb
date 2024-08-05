import React, { useState } from 'react';
import { Usuario } from '../models/Usuario';
import { updateUsuario, inactivateUsuario, checkEmailExists } from '../services/usuarioService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface UpdateUserFormProps {
  userData: Usuario;
  accessToken: string;
  onUpdate: () => void;
}

const UpdateUserForm: React.FC<UpdateUserFormProps> = ({ userData, accessToken, onUpdate }) => {
  const formatCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const [formData, setFormData] = useState<Usuario>({
    ...userData,
    CPF: formatCPF(userData.CPF || ''),
  });

  const [newPassword, setNewPassword] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'CPF' ? formatCPF(value) : value,
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

  const handleDisabledClick = () => {
    toast.info('Clique no botão "Editar" para atualizar os dados.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      if (!validateCPF(formData.CPF)) {
        toast.error('CPF inválido!');
        return;
      }

      if (formData.Email !== userData.Email) {
        const emailExists = await checkEmailExists(formData.Email, accessToken);
        if (emailExists) {
          toast.error('O email já está em uso!');
          return;
        }
      }

      const updatedData = { ...formData, CPF: formatCPF(formData.CPF) };
      if (newPassword) {
        updatedData.Senha = newPassword;
      }

      try {
        await updateUsuario(accessToken, formData.CodigoUsuario, updatedData);
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

  const handleInactivate = async () => {
    try {
      await inactivateUsuario(accessToken, formData.CodigoUsuario);
      setShowModal(false);
      toast.success('Usuário inativado com sucesso!', {
        onClose: () => window.location.reload()
      });
    } catch (error) {
      console.error('Erro ao inativar usuário', error);
      toast.error('Erro ao inativar usuário.', {
        onClose: () => window.location.reload()
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ ...userData, CPF: formatCPF(userData.CPF || '') });
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
            onClick={!isEditing ? handleDisabledClick : undefined}
            className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
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
            onClick={!isEditing ? handleDisabledClick : undefined}
            className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
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
            onClick={!isEditing ? handleDisabledClick : undefined}
            className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
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
            onClick={!isEditing ? handleDisabledClick : undefined}
            className={`w-full p-2 border border-gray-300 rounded ${!isEditing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
          />
        </div>
        {isEditing && (
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="Senha">Nova Senha</label>
            <input
              type="password"
              id="Senha"
              name="Senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <small className="text-white block mt-1">Deixe em branco se não quiser alterar a senha.</small>
          </div>
        )}
        <div className="flex justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {isEditing ? 'Atualizar' : 'Editar'}
          </button>
          <button
            type="button"
            onClick={isEditing ? handleCancelEdit : () => setShowModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            {isEditing ? 'Cancelar' : 'Inativar Usuário'}
          </button>
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirmação</h2>
            <p className="mb-4">Você tem certeza que deseja inativar este usuário?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleInactivate}
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

export default UpdateUserForm;
