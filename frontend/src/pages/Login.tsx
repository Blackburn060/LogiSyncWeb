import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import logoHorizontal from '../assets/images/Logo-LogiSync-Horizontal-02-SF.png';
import imagemLateralLogin from '../assets/images/Imagem-Lateral-Login.png';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backendUrl}/login`, { email, senha: password });
      if (response.data && response.data.token) {
        login(response.data.token);
        navigate('/agendamentos');
      } else {
        toast.error('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (err) {
      toast.error('Credenciais inválidas. Por favor, tente novamente.');
    }
  };

  return (
    <div className="flex h-screen py-10 px-20">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-1/2 flex items-center justify-center bg-white rounded-l-lg">
        <img src={imagemLateralLogin} alt="Image Login Screen" className="w-auto max-h-screen h-auto" />
      </div>
      <div className="w-1/2 flex flex-col justify-center items-center bg-logisync-color-blue-400 rounded-r-lg">
        <img src={logoHorizontal} alt="LogiSync Logo" className="w-64 h-40 mb-10" />
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-4">
            <label htmlFor="email" className="block text-white text-sm font-bold mb-2">Email</label>
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
            <label htmlFor="password" className="block text-white text-sm font-bold mb-2">Senha</label>
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
            <p className="text-white text-xs italic">Esqueceu sua senha?</p>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-logisync-color-blue-50 hover:bg-logisync-color-blue-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Entrar
            </button>
          </div>
          <p className="text-white text-xs mt-4">Não tem uma conta? Cadastre-se aqui!</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
