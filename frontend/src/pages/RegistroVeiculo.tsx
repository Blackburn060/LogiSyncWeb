import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const RegistroVeiculo: React.FC = () => {
  const { user, accessToken, refreshAccessToken } = useAuth();
  const [formData, setFormData] = useState({
    nomeVeiculo: '',
    placa: '',
    marca: '',
    modeloTipo: '',
    anoFabricacao: '',
    cor: '',
    capacidadeCarga: '',
    bloqueado: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user || !accessToken) {
        throw new Error('Usuário não autenticado.');
      }

      const response = await axios.post(`${backendUrl}/veiculos`, { ...formData, codigoUsuario: user.id }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        toast.success('Veículo cadastrado com sucesso!');
        navigate('/agendamentos');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          try {
            await refreshAccessToken();
            handleSubmit(e); // Chama novamente após atualizar o token
          } catch (refreshError) {
            toast.error('Erro ao renovar autenticação. Faça login novamente.');
            navigate('/login'); // Redireciona para login após falha na renovação do token
          }
        } else {
          toast.error('Erro ao cadastrar veículo. Tente novamente.');
        }
      } else {
        toast.error('Erro desconhecido ao cadastrar veículo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500">
      <Toaster position="top-right" />
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Registre o Veículo</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <l-helix size="45" speed="2.5" color="black"></l-helix>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nomeVeiculo">
                Nome do Veículo
              </label>
              <input
                type="text"
                id="nomeVeiculo"
                name="nomeVeiculo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite o nome do veículo"
                value={formData.nomeVeiculo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="placa">
                Placa
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite a placa"
                value={formData.placa}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="marca">
                Marca
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite a marca"
                value={formData.marca}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="modeloTipo">
                Modelo/Tipo
              </label>
              <input
                type="text"
                id="modeloTipo"
                name="modeloTipo"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite o modelo ou tipo"
                value={formData.modeloTipo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="anoFabricacao">
                Ano de Fabricação
              </label>
              <input
                type="text"
                id="anoFabricacao"
                name="anoFabricacao"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite o ano de fabricação"
                value={formData.anoFabricacao}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cor">
                Cor
              </label>
              <input
                type="text"
                id="cor"
                name="cor"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite a cor"
                value={formData.cor}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacidadeCarga">
                Capacidade de Carga
              </label>
              <input
                type="text"
                id="capacidadeCarga"
                name="capacidadeCarga"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Digite a capacidade de carga"
                value={formData.capacidadeCarga}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="bloqueado"
                name="bloqueado"
                className="mr-2 leading-tight"
                checked={formData.bloqueado}
                onChange={handleChange}
              />
              <label className="block text-gray-700 text-sm font-bold" htmlFor="bloqueado">
                Bloqueado
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Finalizar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegistroVeiculo;
