import React, { useEffect, useState } from 'react';
import { getSafras, addSafra, updateSafra } from '../services/safraService';
import { Safra } from '../models/Safra';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const GerenciarSafras: React.FC = () => {
  const { user } = useAuth();
  const [safras, setSafras] = useState<Safra[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [safraToToggle, setSafraToToggle] = useState<Safra | null>(null);
  const [isNovaSafraFormOpen, setIsNovaSafraFormOpen] = useState(false);

  const [anoSafra, setAnoSafra] = useState('');
  const [situacaoSafra, setSituacaoSafra] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSafras();
        setSafras(data);
      } catch (error) {
        toast.error('Erro ao carregar safras');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveSafra = async (safra: Safra) => {
    if (!user) {
      toast.error('Erro: usuário não autenticado');
      return;
    }
    setLoading(true);
    try {
      if (safraToToggle) {
        await updateSafra(safraToToggle.CodigoSafra!, safra, Number(user?.id));
        toast.success('Safra atualizada com sucesso');
      } else {
        await addSafra(safra, Number(user?.id));
        toast.success('Safra adicionada com sucesso');
      }
      const updatedSafras = await getSafras();
      setSafras(updatedSafras);
      setIsNovaSafraFormOpen(false);
      setAnoSafra('');
      setSituacaoSafra(1);
    } catch (error) {
      toast.error('Erro ao salvar safra');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNovaSafra = (e: React.FormEvent) => {
    e.preventDefault();

    if (!anoSafra.trim()) {
      toast.error('Por favor, preencha o campo de Ano Safra.');
      return;
    }

    handleSaveSafra({ AnoSafra: anoSafra, SituacaoSafra: situacaoSafra });
  };

  const handleToggleSafra = async () => {
    if (!user) {
      toast.error('Erro: usuário não autenticado');
      return;
    }

    if (safraToToggle) {
      setLoading(true);
      try {
        const updatedSafra = { ...safraToToggle, SituacaoSafra: safraToToggle.SituacaoSafra === 1 ? 0 : 1 };
        await updateSafra(safraToToggle.CodigoSafra!, updatedSafra, Number(user?.id));
        toast.success(`Safra ${updatedSafra.SituacaoSafra === 1 ? 'ativada' : 'inativada'} com sucesso`);
        const updatedSafras = await getSafras();
        setSafras(updatedSafras);
        setIsModalOpen(false);
      } catch (error) {
        toast.error('Erro ao alterar status da safra');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster />
      <div className="flex-grow flex flex-col items-center p-4 pt-10">
        <div className="w-full max-w-lg bg-logisync-color-blue-400 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center text-white shadow-md bg-logisync-color-blue-50 p-2 rounded">
            Safras
          </h1>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Lista de Safras</h2>
            <button
              onClick={() => setIsNovaSafraFormOpen(true)}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Nova
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <l-helix size="45" speed="2.5" color="white"></l-helix>
            </div>
          ) : (
            <>
              {safras.length === 0 ? (
                <div className="text-center text-white">
                  Não há registros de safras no momento.
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scrollbar-thumb-rounded-full">
                  <ul className="space-y-2">
                    {safras.map((safra) => (
                      <li key={safra.CodigoSafra} className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                          <p>Ano Safra: {safra.AnoSafra}</p>
                          <p>
                            Situação:
                            <span className={safra.SituacaoSafra === 1 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                              {safra.SituacaoSafra === 1 ? ' Ativa' : ' Inativa'}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSafraToToggle(safra);
                            setIsModalOpen(true);
                          }}
                          className={`ml-4 px-4 py-2 rounded-md text-white ${safra.SituacaoSafra === 1 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                          {safra.SituacaoSafra === 1 ? 'Inativar' : 'Ativar'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center shadow-md bg-gray-300 p-2 rounded">
              {`Tem certeza que deseja ${safraToToggle?.SituacaoSafra === 1 ? 'inativar' : 'ativar'} esta safra?`}
            </h2>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleSafra}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Safra */}
      {isNovaSafraFormOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4 text-center shadow-md bg-gray-300 p-2 rounded">Nova Safra</h2>
            <form onSubmit={handleSubmitNovaSafra}>
              <div className="mb-4">
                <label htmlFor="anoSafra" className="block text-sm font-medium text-gray-700">Ano Safra</label>
                <input
                  type="text"
                  id="anoSafra"
                  value={anoSafra}
                  onChange={(e) => setAnoSafra(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700">Situação</span>
                <div className="mt-2 flex items-center">
                  <input
                    type="radio"
                    id="situacaoAtiva"
                    name="situacaoSafra"
                    value={1}
                    checked={situacaoSafra === 1}
                    onChange={(e) => setSituacaoSafra(Number(e.target.value))}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="situacaoAtiva" className="ml-3 block text-sm font-bold text-green-600">
                    Ativa
                  </label>
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="radio"
                    id="situacaoInativa"
                    name="situacaoSafra"
                    value={0}
                    checked={situacaoSafra === 0}
                    onChange={(e) => setSituacaoSafra(Number(e.target.value))}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <label htmlFor="situacaoInativa" className="ml-3 block text-sm font-bold text-red-600">
                    Inativa
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsNovaSafraFormOpen(false)}
                  className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarSafras;
