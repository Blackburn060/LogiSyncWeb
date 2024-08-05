import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import logoHorizontal from '../assets/images/Logo-LogiSync-Horizontal-02-SF.png';
import imagemLateralLogin from '../assets/images/Imagem-Lateral-Login.png';
import api from '../services/axiosConfig';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/login', { email, senha: password });
      if (response.data && response.data.accessToken && response.data.refreshToken) {
        login(response.data.accessToken, response.data.refreshToken);
        navigate('/agendamentos');
      } else {
        toast.error('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.message === 'Network Error' && err.response === undefined) {
          toast.error('Não foi possível conectar ao servidor. Por favor, tente mais tarde.');
        } else if (err.response?.status === 500) {
          toast.error('Erro interno do servidor. Por favor, tente mais tarde.');
        } else if (err.response?.status === 401) {
          toast.error('Credenciais inválidas. Por favor, tente novamente.');
        } else {
          toast.error('Erro desconhecido. Por favor, tente mais tarde.');
        }
      } else {
        toast.error('Erro desconhecido. Por favor, tente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen py-10 px-24">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-1/2 flex items-center justify-center bg-white rounded-l-lg">
        <img src={imagemLateralLogin} alt="Image Login Screen" className="w-auto h-full" />
      </div>
      <div className="w-1/2 flex flex-col justify-center items-center bg-logisync-color-blue-400 rounded-r-lg">
        <img src={logoHorizontal} alt="LogiSync Logo" className="w-56 pb-3" />
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-4">
            <label htmlFor="email" className="block text-white text-lg font-extrabold mb-1">Email</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-white text-lg font-extrabold mb-1">Senha</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite a sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <p className="text-white text-md font-extrabold text-right">Esqueceu sua senha?</p>
          </div>
          <div className="flex items-center justify-center pt-8">
            <button
              type="submit"
              className="bg-logisync-color-blue-50 hover:bg-logisync-color-blue-200 text-white text-2xl font-extrabold py-2 px-32 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin text-3xl" /> : 'Entrar'}
            </button>
          </div>
          <p className="text-white text-lg font-extrabold mt-4 text-center">Não tem uma conta? <Link to="/registro/usuario" target='_blank' className='underline'>Cadastre-se aqui!</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;