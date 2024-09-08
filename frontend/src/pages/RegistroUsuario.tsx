import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import imagemLateralLogin from '../assets/images/Imagem-Lateral-Login.webp';
import { FaAsterisk } from 'react-icons/fa';

const RegistroUsuario: React.FC = () => {
  const [formData, setFormData] = useState({
    nomecompleto: '',
    email: '',
    senha: '',
    cpf: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.setItem('registroUsuario', JSON.stringify(formData));
      navigate('/registro/transportadora');
    } catch (err) {
      toast.error('Erro ao salvar dados do usuário. Tente novamente.');
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
        <form onSubmit={handleSubmit} className="w-full max-w-sm">

          <div className="mb-6">
            <h1 className="bg-logisync-color-blue-50 text-white text-2xl font-extrabold py-2 w-full rounded flex items-center justify-center">Insira seus dados</h1>
          </div>
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="nomecompleto">
              Nome Completo
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
            <input
              type="text"
              id="nomecompleto"
              name="nomecompleto"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu nome completo"
              value={formData.nomecompleto}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="cpf">
              CPF
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="email">
              E-mail
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
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
          <div className="mb-6">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="senha">
              Senha
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
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
