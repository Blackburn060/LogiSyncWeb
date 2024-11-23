import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import Cleave from 'cleave.js/react';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { checkEmailExistsPublic } from '../services/usuarioService';
import imagemLateralLogin from '../assets/images/Imagem-Lateral-Login.webp';
import { FaAsterisk } from 'react-icons/fa';

const RegistroUsuario: React.FC = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    confirmarEmail: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, cpf: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação do CPF
      const cleanedCPF = formData.cpf.replace(/\D/g, '');
      if (!cpfValidator.isValid(cleanedCPF)) {
        toast.error('CPF inválido. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      // Validação de e-mail
      if (formData.email !== formData.confirmarEmail) {
        toast.error('Os e-mails não coincidem. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      // Validação de senha
      if (formData.senha !== formData.confirmarSenha) {
        toast.error('As senhas não coincidem. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      // Verificação de e-mail no servidor
      const { exists, active } = await checkEmailExistsPublic(formData.email);

      if (exists && active) {
        toast.error('E-mail já utilizado em outra conta. Por favor, use outro e-mail.');
        setLoading(false);
        return;
      }

      // Salvar dados e redirecionar
      localStorage.setItem('registroUsuario', JSON.stringify(formData));
      navigate('/registro/transportadora');
    } catch (err) {
      toast.error('Erro ao verificar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex lg:flex-row h-screen lg:py-10 lg:px-24">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white rounded-l-lg">
        <img src={imagemLateralLogin} alt="Image Login Screen" className="w-auto h-full object-contain" />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-logisync-color-blue-400 lg:rounded-lg lg:rounded-r-lg lg:rounded-l-none">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scrollbar-thumb-rounded-full"
        >
          <div className="mb-6">
            <h1 className="bg-logisync-color-blue-50 text-white text-2xl font-extrabold py-2 w-full rounded flex items-center justify-center">
              Insira seus dados
            </h1>
          </div>

          {/* Nome Completo */}
          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="nomeCompleto">
              Nome Completo
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu nome completo"
              value={formData.nomeCompleto}
              onChange={handleChange}
              required
            />
          </div>

          {/* CPF */}
          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="cpf">
              CPF
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <Cleave
              id="cpf"
              name="cpf"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu CPF"
              options={{ blocks: [3, 3, 3, 2], delimiters: ['.', '.', '-'], numericOnly: true }}
              value={formData.cpf}
              onChange={handleCPFChange}
              required
            />
          </div>

          {/* E-mail */}
          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="email">
              E-mail
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu e-mail"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirmar E-mail */}
          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="confirmarEmail">
              Confirmar E-mail
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <input
              type="email"
              id="confirmarEmail"
              name="confirmarEmail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Confirme o seu e-mail"
              value={formData.confirmarEmail}
              onChange={handleChange}
              required
            />
          </div>

          {/* Senha */}
          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="senha">
              Senha
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite a sua senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirmar Senha */}
          <div className="mb-6">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="confirmarSenha">
              Confirmar Senha
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Confirme a sua senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botão de Enviar */}
          <div className="mb-4">
            <button
              type="submit"
              className="bg-logisync-color-blue-50 hover:bg-logisync-color-blue-200 text-white text-2xl font-extrabold py-2 w-full rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin text-3xl" /> : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroUsuario;