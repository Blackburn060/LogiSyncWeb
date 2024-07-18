import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const RegistroUsuario = () => {
  const { setUser, setToken } = useAuth();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    celular: '',
    email: '',
    senha: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/usuarios`, formData);
      setUser(response.data.user);
      setToken(response.data.token);
    } catch (err) {
      setError('Erro ao cadastrar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Insira seus dados</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nomeCompleto">
              Nome Completo
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpf">
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu CPF"
              value={formData.cpf}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="celular">
              Celular
            </label>
            <input
              type="text"
              id="celular"
              name="celular"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o seu celular"
              value={formData.celular}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              E-mail
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
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="senha">
              Senha
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
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroUsuario;
