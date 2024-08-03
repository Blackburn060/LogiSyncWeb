import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

const backendUrl = import.meta.env.VITE_APP_BACKEND_API_URL;

interface Agendamento {
  DataAgendamento: string;
  HoraAgendamento: string;
  Placa: string;
  SituacaoAgendamento: string;
}

const MeusAgendamentos: React.FC = () => {
  const { user, accessToken, refreshToken, refreshAccessToken } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
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
        const response = await axios.get(`${backendUrl}/agendamentos?CodigoUsuario=${user?.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAgendamentos(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401 && refreshToken) {
          try {
            await refreshAccessToken();
            const response = await axios.get(`${backendUrl}/agendamentos?CodigoUsuario=${user?.id}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
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
      <div>
        <Navbar />
        <Toaster position="top-right" />
        <div className="flex justify-center items-center h-screen">
          <ClipLoader size={150} />
        </div>
      </div>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div>
      <Navbar />
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <ClipLoader size={150} />
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Meus agendamentos</h1>
          <div className="border border-black rounded-md p-4 max-w-3xl mx-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b-2 border-black p-2 text-left">Data</th>
                    <th className="border-b-2 border-black p-2 text-left">Horário</th>
                    <th className="border-b-2 border-black p-2 text-left">Placa</th>
                    <th className="border-b-2 border-black p-2 text-left">Status</th>
                    <th className="border-b-2 border-black p-2 text-left">Cancelar</th>
                  </tr>
                </thead>
                <tbody>
                  {agendamentos.map((agendamento, index) => (
                    <tr key={index} className="bg-logisync-color-blue-100 text-white">
                      <td className="border-b border-black p-2">{agendamento.DataAgendamento}</td>
                      <td className="border-b border-black p-2">{agendamento.HoraAgendamento}</td>
                      <td className="border-b border-black p-2">{agendamento.Placa}</td>
                      <td className="border-b border-black p-2">{agendamento.SituacaoAgendamento}</td>
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
