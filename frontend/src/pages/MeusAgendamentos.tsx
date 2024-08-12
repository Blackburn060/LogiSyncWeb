import React, { useEffect, useState } from 'react';
import api, { isAxiosError } from '../services/axiosConfig';
import Navbar from '../components/Navbar';
import { Agendamento } from '../models/Agendamento';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const MeusAgendamentos: React.FC = () => {
  const { user, accessToken, refreshToken, refreshAccessToken } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  useEffect(() => {
    const checkAuthAndFetchAgendamentos = async () => {
      if (!user || !accessToken) {
        if (refreshToken) {
          try {
            await refreshAccessToken();
          } catch (err) {
            toast.error('Erro ao renovar autenticação. Redirecionando para login.');
            setAuthChecked(true);
            return;
          }
        } else {
          setAuthChecked(true);
          return;
        }
      }

      setAuthChecked(true);

      try {
        const response = await api.get(`/agendamentos-com-placa?CodigoUsuario=${user?.id}`);
        setAgendamentos(response.data);
      } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.status === 401 && refreshToken) {
          try {
            await refreshAccessToken();
            const response = await api.get(`/agendamentos-com-placa?CodigoUsuario=${user?.id}`);
            setAgendamentos(response.data);
          } catch (refreshError) {
            toast.error('Erro ao carregar agendamentos.');
          }
        } else {
          toast.error('Erro ao carregar agendamentos.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchAgendamentos();
  }, [accessToken, user, refreshToken, refreshAccessToken]);

  const handleCancelClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsCancelModalOpen(true);
  };

  const cancelAgendamento = async () => {
    if (!selectedAgendamento) return;

    try {
      await api.put(`/agendamentos/cancelar/${selectedAgendamento.CodigoAgendamento}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success('Agendamento cancelado com sucesso!');
      setAgendamentos(prev => prev.filter(a => a.CodigoAgendamento !== selectedAgendamento.CodigoAgendamento));
    } catch (error) {
      toast.error('Erro ao cancelar agendamento.');
    } finally {
      setIsCancelModalOpen(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Toaster position="top-right" />
        <div className="flex flex-grow justify-center items-center">
          <l-helix size="45" speed="2.5" color="black"></l-helix>
        </div>
      </div>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex flex-grow justify-center items-center">
          <l-helix size="45" speed="2.5" color="black"></l-helix>
        </div>
      ) : (
        <div className="container mx-auto pt-10 flex-grow">
          <h1 className="text-2xl font-extrabold mb-2 max-w-3xl mx-auto">Meus agendamentos</h1>
          <div className="border border-black rounded-md px-4 pb-4 max-w-3xl mx-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className='text-2xl text-center font-extrabold'>
                    <th className="p-2">Data</th>
                    <th className="p-2">Horário</th>
                    <th className="p-2">Placa</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Cancelar</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.map((agendamento, index) => (
                    <tr key={index} className="bg-logisync-color-blue-100 text-white">
                      <td className="border-b border-black p-2 text-center">{agendamento.DataAgendamento}</td>
                      <td className="border-b border-black p-2 text-center">{agendamento.HoraAgendamento}</td>
                      <td className="border-b border-black p-2 text-center">{agendamento.Placa}</td>
                      <td className="border-b border-black p-2 text-left">{agendamento.SituacaoAgendamento}</td>
                      <td className="border-b border-black p-2 text-center">
                        {agendamento.SituacaoAgendamento === 'Pendente' ? (
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleCancelClick(agendamento)}
                          >
                            <svg className="w-6 h-6 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        ) : (
                          <button className="text-gray-400 cursor-not-allowed" disabled>
                            <svg className="w-6 h-6 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isCancelModalOpen}
        onRequestClose={() => setIsCancelModalOpen(false)}
        contentLabel="Confirmar Cancelamento"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar Cancelamento</h2>
          <p className="mb-4">
            Tem certeza que deseja cancelar o agendamento de {selectedAgendamento?.DataAgendamento} às {selectedAgendamento?.HoraAgendamento}?
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded"
            >
              Voltar
            </button>
            <button
              onClick={cancelAgendamento}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Cancelar Agendamento
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MeusAgendamentos;
