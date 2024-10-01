import React, { useState, useEffect } from 'react';
import { Usuario } from '../models/Usuario';
import { checkEmailExists } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

interface UsuarioFormProps {
  usuario: Partial<Usuario>;
  onSave: (usuario: Partial<Usuario>) => Promise<void>;
  onCancel: () => void;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ usuario: initialUsuario, onSave, onCancel }) => {
  const { token } = useAuth();
  const [usuario, setUsuario] = useState<Partial<Usuario>>(initialUsuario);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailChecking, setIsEmailChecking] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [originalEmail, setOriginalEmail] = useState<string | null>(initialUsuario.Email || null);

  useEffect(() => {
    setUsuario(initialUsuario);
    setOriginalEmail(initialUsuario.Email || null);
  }, [initialUsuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUsuario((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'Email') {
      setEmailError(null);
    }
  };

  const handleToggleChange = () => {
    setUsuario((prevState) => ({
      ...prevState,
      SituacaoUsuario: prevState.SituacaoUsuario === 1 ? 0 : 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ['NomeCompleto', 'Email', 'CPF', 'NumeroCelular', 'TipoUsuario'];
    for (const field of requiredFields) {
      if (!usuario[field as keyof Usuario]) {
        alert(`O campo ${field} é obrigatório.`);
        return;
      }
    }

    if (!usuario.Email || emailError) {
      alert('Por favor, corrija os erros antes de prosseguir.');
      return;
    }

    setIsSaving(true);

    const usuarioToUpdate = { ...usuario };
    delete usuarioToUpdate.Senha;

    try {
      await onSave({
        ...usuarioToUpdate,
        TipoUsuario: usuario.TipoUsuario?.toLowerCase(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailBlur = async () => {
    if (usuario.Email && token && usuario.Email !== originalEmail) {
      setIsEmailChecking(true);
      try {
        const emailExists = await checkEmailExists(usuario.Email, token);
        if (emailExists) {
          setEmailError('Este e-mail já está em uso por outro usuário.');
        } else {
          setEmailError(null);
        }
      } catch (error) {
        console.error('Erro ao verificar e-mail:', error);
        setEmailError('Erro ao verificar e-mail.');
      } finally {
        setIsEmailChecking(false);
      }
    } else {
      setEmailError(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-logisync-color-blue-400 p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-white">{usuario.CodigoUsuario ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-white">Nome Completo</label>
              <input
                type="text"
                name="NomeCompleto"
                value={usuario.NomeCompleto || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Celular</label>
              <input
                type="text"
                name="NumeroCelular"
                value={usuario.NumeroCelular || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-white">E-mail</label>
              <input
                type="email"
                name="Email"
                value={usuario.Email || ''}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              {emailError && <p className="text-red-500 mt-1">{emailError}</p>}
              {isEmailChecking && (
                <p className="text-blue-500 mt-1 flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Verificando e-mail...
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-white">CPF</label>
              <input
                type="text"
                name="CPF"
                value={usuario.CPF || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-white">Tipo de Usuário</label>
              <select
                name="TipoUsuario"
                value={usuario.TipoUsuario || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Escolha um tipo</option>
                <option value="admin">Administrador</option>
                <option value="user">Usuário</option>
                <option value="motorista">Motorista</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block mb-2 text-white">Situação</label>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={usuario.SituacaoUsuario === 1}
                    onChange={handleToggleChange}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-white">{usuario.SituacaoUsuario === 1 ? 'Ativo' : 'Inativo'}</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="mr-4 px-4 py-2 bg-gray-300 font-bold text-black rounded"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-logisync-color-blue-50 text-white font-bold rounded flex items-center justify-center"
              disabled={!!emailError || isEmailChecking || isSaving}
            >
              {isSaving ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsuarioForm;
