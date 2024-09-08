import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaAsterisk } from 'react-icons/fa';
import imagemCadastroVeiculo from '../assets/images/ImagemCadastroVeículo.webp';
import { useAuth } from '../context/AuthContext';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const RegistroVeiculo: React.FC = () => {
  const { user, token, refreshAccessToken } = useAuth();
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
      if (!user || !token) {
        throw new Error('Usuário não autenticado.');
      }

      const response = await axios.post(`${backendUrl}/veiculos`, { ...formData, codigoUsuario: user.id }, {
        headers: {
          Authorization: `Bearer ${token}`,
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
            handleSubmit(e);
          } catch (refreshError) {
            toast.error('Erro ao renovar autenticação. Faça login novamente.');
            navigate('/login');
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
    <div className="flex lg:flex-row h-screen lg:py-10 lg:px-24">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white rounded-l-lg">
        <img src={imagemCadastroVeiculo} alt="Imagem Cadastro Veículo" className="w-auto h-full object-contain" />
      </div>
      
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-logisync-color-blue-400 lg:rounded-lg lg:rounded-r-lg lg:rounded-l-none">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="bg-logisync-color-blue-50 text-white text-2xl font-extrabold py-2 w-full rounded flex items-center justify-center">
              Cadastre seu primeiro Veículo
            </h1>
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="nomeVeiculo">
              Nome do veículo
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="nomeVeiculo"
              name="nomeVeiculo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o Nome do Veículo"
              value={formData.nomeVeiculo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="placa">
              Placa
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="placa"
              name="placa"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite a placa do Veículo"
              value={formData.placa}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="marca">
              Marca
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite a marca do Veículo"
              value={formData.marca}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="modeloTipo">
              Modelo/Tipo
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="modeloTipo"
              name="modeloTipo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o Modelo ou Tipo do Veículo"
              value={formData.modeloTipo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="anoFabricacao">
              Ano de Fabricação
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="anoFabricacao"
              name="anoFabricacao"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o ano de fabricação do Veículo"
              value={formData.anoFabricacao}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="cor">
              Cor
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="cor"
              name="cor"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite a cor do Veículo"
              value={formData.cor}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="capacidadeCarga">
              Capacidade de Carga
              <FaAsterisk size={13} color='red' className='ml-2' />
            </label>
            <input
              type="text"
              id="capacidadeCarga"
              name="capacidadeCarga"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite a capacidade do Veículo"
              value={formData.capacidadeCarga}
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
              {loading ? <FaSpinner className="animate-spin text-3xl" /> : 'Finalizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroVeiculo;
