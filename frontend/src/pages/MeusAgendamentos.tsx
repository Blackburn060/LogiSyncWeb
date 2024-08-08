import React, { useEffect, useState } from 'react';
import api, { isAxiosError } from '../services/axiosConfig';
import Navbar from '../components/Navbar';
import { Agendamento } from '../models/Agendamento';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface AgendamentoComPlaca extends Agendamento {
  Placa: string;
}

const MeusAgendamentos: React.FC = () => {
  const { user, accessToken, refreshToken, refreshAccessToken } = useAuth();
  const [agendamentos, setAgendamentos] = useState<AgendamentoComPlaca[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

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
                  {agendamentos.map((agendamento) => (
                    <tr key={agendamento.CodigoAgendamento} className="bg-logisync-color-blue-100 text-white">
                      <td className="border-b border-black p-2 text-center">{agendamento.DataAgendamento}</td>
                      <td className="border-b border-black p-2 text-center">{agendamento.HoraAgendamento}</td>
                      <td className="border-b border-black p-2 text-center">{agendamento.Placa}</td>
                      <td className="border-b border-black p-2 text-left">{agendamento.SituacaoAgendamento}</td>
                      <td className="border-b border-black p-2">
                        <button className="text-red-600 hover:text-red-800">
                          <svg className="w-6 h-6 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeusAgendamentos;
