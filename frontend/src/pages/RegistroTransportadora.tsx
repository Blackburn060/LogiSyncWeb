import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import imagemCadastroVeiculo from '../assets/images/ImagemCadastroVeículo.webp';
import { FaAsterisk } from 'react-icons/fa';

const RegistroTransportadora: React.FC = () => {
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    nomeFantasia: '',
    cnpj: '',
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
      localStorage.setItem('RegistroTransportadora', JSON.stringify(formData));
      navigate('/registro/veiculo');
    } catch (err) {
      toast.error('Erro ao salvar dados da transportadora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/registro/veiculo');
  };

  return (
    <div className="flex lg:flex-row h-screen lg:py-10 lg:px-24">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white rounded-l-lg">
        <img src={imagemCadastroVeiculo} alt="Imagem Cadastro Veículo" className="w-auto h-full" />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-logisync-color-blue-400 lg:rounded-lg lg:rounded-r-lg lg:rounded-l-none">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="bg-logisync-color-blue-50 text-white text-2xl font-extrabold py-2 w-full rounded flex items-center justify-center">Registre a Transportadora</h1>
          </div>
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="nomeEmpresa">
              Nome Empresa
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
            <input
              type="text"
              id="nomeEmpresa"
              name="nomeEmpresa"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o nome da empresa"
              value={formData.nomeEmpresa}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="nomeFantasia">
              Nome Fantasia
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
            <input
              type="text"
              id="nomeFantasia"
              name="nomeFantasia"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o nome fantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="flex text-white text-lg font-extrabold mb-1" htmlFor="cnpj">
              CNPJ
              <FaAsterisk size={13} color='red' className='ml-2' /></label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o CNPJ"
              value={formData.cnpj}
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
          <div className="mb-4">
            <button
              type="button"
              onClick={handleSkip}
              className="bg-white hover:bg-gray-200 text-black text-2xl font-extrabold py-2 w-full rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
            >
              Pular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroTransportadora;