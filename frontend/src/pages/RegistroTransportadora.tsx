import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistroTransportadora: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    nomeFantasia: '',
    cnpj: '',
  });
  const [error, setError] = useState('');
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
      localStorage.setItem('registroTransportadora', JSON.stringify(formData));
      navigate('/registro-veiculo');
    } catch (err) {
      setError('Erro ao salvar dados da transportadora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Registre a Transportadora</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">
              Nome Empresa
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite o nome da empresa"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nomeFantasia">
              Nome Fantasia
            </label>
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpj">
              CNPJ
            </label>
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
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroTransportadora;
