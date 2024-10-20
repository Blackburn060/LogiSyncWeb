import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cleave from 'cleave.js/react';
import { NumericFormat } from 'react-number-format';
import { Toaster, toast } from 'react-hot-toast';
import { FaSpinner, FaAsterisk } from 'react-icons/fa';
import imagemCadastroVeiculo from '../assets/images/ImagemCadastroVeículo.webp';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

const RegistroVeiculo: React.FC = () => {
  const [formData, setFormData] = useState({
    nomeVeiculo: '',
    placa: '',
    marca: '',
    modeloTipo: '',
    anoFabricacao: '',
    cor: '',
    capacidadeCarga: '',
    bloqueado: 1,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('registroUsuario') || '{}');
    const transportadora = JSON.parse(localStorage.getItem('RegistroTransportadora') || '{}');

    if (!usuario || !usuario.nomeCompleto) {
      toast.error('Dados do usuário não encontrados. Complete o cadastro.');
      navigate('/registro/usuario');
    }
  }, [navigate]);

  const handleCapacidadeChange = (values: any) => {
    const { value } = values;
    setFormData({ ...formData, capacidadeCarga: value });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usuario = JSON.parse(localStorage.getItem('registroUsuario') || '{}');
      const transportadora = JSON.parse(localStorage.getItem('RegistroTransportadora') || '{}');

      try {
        const usuarioResponse = await axios.post(`${backendUrl}/usuarios/public`, usuario);
        const codigoUsuario = usuarioResponse.data.id;
        toast.success('Usuário cadastrado com sucesso!');

        let codigoTransportadora: number | null = null;
        if (transportadora && transportadora.nomeEmpresa) {
          try {
            const transportadoraResponse = await axios.post(`${backendUrl}/transportadoras/public`, {
              ...transportadora,
              userId: codigoUsuario,
            });
            codigoTransportadora = transportadoraResponse.data.transportadora.CodigoTransportadora;
            toast.success('Transportadora cadastrada com sucesso!');
          } catch (error) {
            toast.error('Erro ao cadastrar a transportadora. Tente novamente.');
            return;
          }
        }

        const veiculoData = { ...formData, CodigoUsuario: codigoUsuario };
        try {
          const veiculoResponse = await axios.post(`${backendUrl}/veiculos/public`, veiculoData);
          if (veiculoResponse.status === 201) {
            toast.success('Veículo cadastrado com sucesso!');
            navigate('/login');
          }
        } catch (error) {
          toast.error('Erro ao cadastrar o veículo. Tente novamente.');
        }

      } catch (error) {
        toast.error('Erro ao cadastrar o usuário. Tente novamente.');
      }

    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:py-10 lg:px-24 overflow-y-auto">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white rounded-l-lg">
        <img src={imagemCadastroVeiculo} alt="Imagem Cadastro Veículo" className="w-auto h-full object-contain" />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-logisync-color-blue-400 lg:rounded-lg lg:rounded-r-lg lg:rounded-l-none p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scrollbar-thumb-rounded-full">
          <div className="mb-6">
            <h1 className="bg-logisync-color-blue-50 text-white text-2xl font-extrabold py-2 w-full rounded flex items-center justify-center">
              Cadastre seu primeiro Veículo
            </h1>
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="nomeVeiculo">
              Nome do veículo
              <FaAsterisk size={11} color='red' className='ml-1' />
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
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="placa">
              Placa
              <FaAsterisk size={11} color='red' className='ml-1' />
            </label>
            <Cleave
              id="placa"
              name="placa"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex. ABC-1234"
              options={{ blocks: [7], uppercase: true }}
              value={formData.placa}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="marca">
              Marca
              <FaAsterisk size={11} color='red' className='ml-1' />
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex. Ford, Scania..."
              value={formData.marca}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="modeloTipo">
              Modelo/Tipo
              <FaAsterisk size={11} color='red' className='ml-1' />
            </label>
            <input
              type="text"
              id="modeloTipo"
              name="modeloTipo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex. Cavalo mecânico simples, Carreta 2 eixos..."
              value={formData.modeloTipo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="anoFabricacao">
              Ano de Fabricação
              <FaAsterisk size={11} color='red' className='ml-1' />
            </label>
            <Cleave
              id="anoFabricacao"
              name="anoFabricacao"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex. 2027"
              options={{ numericOnly: true, blocks: [4] }}
              value={formData.anoFabricacao}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="cor">
              Cor
              <FaAsterisk size={11} color='red' className='ml-1' />
            </label>
            <input
              type="text"
              id="cor"
              name="cor"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex. Cinza"
              value={formData.cor}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex text-white text-lg font-bold mb-1" htmlFor="capacidadeCarga">
              Capacidade de Carga
              <FaAsterisk size={11} color="red" className="ml-1" />
            </label>
            <NumericFormat
              id="capacidadeCarga"
              name="capacidadeCarga"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ex. 20 ton"
              suffix=" ton"
              decimalScale={0}
              allowNegative={false}
              valueIsNumericString
              value={formData.capacidadeCarga}
              onValueChange={handleCapacidadeChange}
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