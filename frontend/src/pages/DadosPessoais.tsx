import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { useForm, Controller } from 'react-hook-form';
import Cleave from 'cleave.js/react';
import { getUsuarioById, updateUsuario, inactivateUsuario, checkEmailExists } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import { Usuario } from '../models/Usuario';
import toast, { Toaster } from 'react-hot-toast';
import { cpf as cpfValidator, cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import { FaSpinner } from 'react-icons/fa';

const DadosPessoais: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { control, handleSubmit, setValue, reset } = useForm();

  const fetchUsuario = useCallback(async () => {
    setIsLoading(true);
    if (token && user) {
      try {
        const usuarioData = await getUsuarioById(token, Number(user.id));
        if (usuarioData) {
          setUsuario(usuarioData);
          setValue('NomeCompleto', usuarioData.NomeCompleto);
          setValue('Email', usuarioData.Email);
          setValue('CPF', usuarioData.CPF);
          setValue('NumeroCelular', usuarioData.NumeroCelular);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da conta', error);
        toast.error('Erro ao buscar detalhes da conta');
      } finally {
        setIsLoading(false);
      }
    }
  }, [token, user, setValue]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const onSubmit = async (data: any) => {
    if (token && usuario) {
      setIsUpdating(true);
      data.Email = data.Email.toLowerCase();

      const cleanedCPF = data.CPF.replace(/\D/g, '');

      if (cleanedCPF.length <= 11 && !cpfValidator.isValid(cleanedCPF)) {
        toast.error('CPF inválido!');
        setIsUpdating(false);
        return;
      } else if (cleanedCPF.length > 11 && !cnpjValidator.isValid(cleanedCPF)) {
        toast.error('CNPJ inválido!');
        setIsUpdating(false);
        return;
      }

      if (data.Email !== usuario.Email) {
        const emailExists = await checkEmailExists(data.Email, token);
        if (emailExists) {
          toast.error('O e-mail informado já está registrado em outra conta! Tente outro e-mail!');
          setIsUpdating(false);
          return;
        }
      }

      const updatedData = { ...data };

      try {
        await updateUsuario(token, usuario.CodigoUsuario, updatedData);
        fetchUsuario();
        setShowUpdateModal(false);
        toast.success('Dados atualizados com sucesso!');
      } catch (error) {
        toast.error('Erro ao atualizar conta.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setIsUpdatingPassword(true);

    if (!newPassword || !confirmPassword) {
      setPasswordError('Por favor, preencha os dois campos de senha.');
      setIsUpdatingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem!');
      setIsUpdatingPassword(false);
      return;
    }

    if (usuario && token) {
      try {
        await updateUsuario(token, usuario.CodigoUsuario, { Senha: newPassword });
        setShowPasswordModal(false);
        toast.success('Senha atualizada com sucesso!');
      } catch (error) {
        toast.error('Erro ao atualizar senha.');
      } finally {
        setIsUpdatingPassword(false);
      }
    }
  };

  const handleInactivate = async () => {
    setIsDeleting(true);
    if (usuario && token) {
      try {
        await inactivateUsuario(token, usuario.CodigoUsuario);
        setShowModal(false);
        setShowRedirectModal(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 5000);
      } catch (error) {
        toast.error('Erro ao excluir conta.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleMaskCPF_CNPJ = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length > 14) {
      return value.slice(0, 14);
    } else if (value.length > 11) {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const handleCancelEdit = () => {
    reset({
      NomeCompleto: usuario?.NomeCompleto,
      Email: usuario?.Email,
      CPF: usuario?.CPF,
      NumeroCelular: usuario?.NumeroCelular,
    });
    setShowUpdateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster position="top-right" containerClassName='mt-20' />
      <div className="flex-grow flex flex-col items-center p-4 pt-10">
        <div className="w-full max-w-lg bg-logisync-color-blue-400 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white shadow-md bg-logisync-color-blue-50 p-2 rounded">Dados Pessoais</h1>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <l-helix size="45" speed="2.5" color="white"></l-helix>
            </div>
          ) : !usuario ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-lg text-white">Nenhum dado encontrado.</p>
            </div>
          ) : (
            <>
              <form>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="NomeCompleto">Nome Completo</label>
                  <input
                    value={usuario.NomeCompleto}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="Email">Email</label>
                  <input
                    value={usuario.Email}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="CPF">CPF/CNPJ</label>
                  <input
                    value={handleMaskCPF_CNPJ(usuario.CPF)}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="NumeroCelular">Número Celular</label>
                  <Controller
                    name="NumeroCelular"
                    control={control}
                    render={({ field }) => (
                      <Cleave
                        {...field}
                        value={usuario.NumeroCelular}
                        options={{ delimiters: ['(', ') ', '-'], blocks: [0, 2, 5, 4], numericOnly: true }}
                        disabled
                        className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                      />
                    )}
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <FaSpinner className="animate-spin text-2xl" /> : 'Editar Dados'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? <FaSpinner className="animate-spin text-2xl" /> : 'Atualizar Senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <FaSpinner className="animate-spin text-2xl" /> : 'Excluir Conta'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Modal de Atualização de Dados */}
      {showUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transform transition-transform duration-300 scale-100">
            <h2 className="text-xl font-bold mb-4 text-center shadow-md bg-gray-300 p-2 rounded">Atualizar Dados</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="NomeCompleto">Nome Completo</label>
                <Controller
                  control={control}
                  name="NomeCompleto"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="NomeCompleto"
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="Email">Email</label>
                <Controller
                  control={control}
                  name="Email"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="Email"
                      type="email"
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="CPF">CPF/CNPJ</label>
                <Controller
                  control={control}
                  name="CPF"
                  render={({ field }) => (
                    <input
                      {...field}
                      value={handleMaskCPF_CNPJ(field.value)}
                      onChange={(e) => field.onChange(handleMaskCPF_CNPJ(e.target.value))}
                      id="CPF"
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="NumeroCelular">Número Celular</label>
                <Controller
                  control={control}
                  name="NumeroCelular"
                  render={({ field }) => (
                    <Cleave
                      {...field}
                      options={{ delimiters: ['(', ') ', '-'], blocks: [0, 2, 5, 4], numericOnly: true }}
                      required
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-300 text-black rounded shadow-md mr-2">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700 transition duration-300" disabled={isUpdating}>
                  {isUpdating ? <FaSpinner className="animate-spin text-2xl" /> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Atualização de Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transform transition-transform duration-300 scale-100">
            <h2 className="text-xl font-bold mb-4 text-center shadow-md bg-gray-300 p-2 rounded">Atualizar Senha</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="Senha">Nova Senha</label>
                <input
                  type="password"
                  id="Senha"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  required
                  className={`w-full p-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-600`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-black mb-2" htmlFor="ConfirmSenha">Confirmar Senha</label>
                <input
                  type="password"
                  id="ConfirmSenha"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  required
                  className={`w-full p-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-600`}
                />
              </div>

              {passwordError && (
                <p className="text-red-600 mb-4">{passwordError}</p>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-black rounded shadow-md mr-2"
                  disabled={isUpdatingPassword}
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700 transition duration-300" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <FaSpinner className="animate-spin text-2xl" /> : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Conta */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center shadow-md bg-gray-300 p-2 rounded">Confirmação</h2>
            <p className="mb-4">Você tem certeza que deseja excluir sua conta?</p>
            <div className="flex justify-between">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-black rounded shadow-md mr-2" disabled={isDeleting}>
                Cancelar
              </button>
              <button onClick={handleInactivate} className="px-4 py-2 bg-red-600 text-white rounded shadow-md hover:bg-red-700 transition duration-300" disabled={isDeleting}>
                {isDeleting ? <FaSpinner className="animate-spin text-2xl" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Redirecionamento após Exclusão */}
      {showRedirectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center shadow-md bg-gray-300 p-2 rounded">Conta Excluída</h2>
            <p className="mb-4">Sua conta foi excluída com sucesso. Você será redirecionado para a tela de login em breve!</p>
            <div className="flex justify-center">
              <FaSpinner className="animate-spin text-2xl text-black" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DadosPessoais;