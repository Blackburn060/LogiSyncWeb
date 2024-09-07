import React, { useEffect, useState } from "react";
import api, { isAxiosError } from "../services/axiosConfig";
import Navbar from "../components/Navbar";
import { Agendamento } from "../models/Agendamento";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Modal from "react-modal";
import formatDate from "../../utils/formatDate";

// Importar os componentes de dados
import DadosPessoais from "../components/DadosPessoais";
import DadosVeicular from "../components/DadosVeicular";
import DadosAgendamento from "../components/DadosAgendamento";
import DadosPortaria from "../components/DadosPortaria";

Modal.setAppElement("#root");

const MeusAgendamentos: React.FC = () => {
  const { user, accessToken, refreshToken, refreshAccessToken } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Função para buscar agendamentos
  useEffect(() => {
    const checkAuthAndFetchAgendamentos = async () => {
      if (!user || !accessToken) {
        if (refreshToken) {
          try {
            await refreshAccessToken();
          } catch (err) {
            toast.error(
              "Erro ao renovar autenticação. Redirecionando para login."
            );
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
        const response = await api.get(
          `/agendamentos-com-placa?CodigoUsuario=${user?.id}`
        );
        setAgendamentos(response.data);
      } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.status === 401 && refreshToken) {
          try {
            await refreshAccessToken();
            const response = await api.get(
              `/agendamentos-com-placa?CodigoUsuario=${user?.id}`
            );
            setAgendamentos(response.data);
          } catch (refreshError) {
            toast.error("Erro ao carregar agendamentos.");
          }
        } else {
          toast.error("Erro ao carregar agendamentos.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchAgendamentos();
  }, [accessToken, user, refreshToken, refreshAccessToken]);

  // Função para abrir o modal de detalhes
  const handleAgendamentoClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsDetailModalOpen(true);
  };

  // Função para abrir o modal de cancelamento
  const handleCancelClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsCancelModalOpen(true);
  };

  // Função para cancelar o agendamento
  const cancelAgendamento = async () => {
    if (!selectedAgendamento) return;

    try {
      await api.put(
        `/agendamentos/cancelar/${selectedAgendamento.CodigoAgendamento}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Agendamento cancelado com sucesso!");
      setAgendamentos((prev) =>
        prev.filter(
          (a) => a.CodigoAgendamento !== selectedAgendamento.CodigoAgendamento
        )
      );
    } catch (error) {
      toast.error("Erro ao cancelar agendamento.");
    } finally {
      setIsCancelModalOpen(false);
    }
  };

  const handleInactiveCancelClick = () => {
    toast.error(
      "Somente é possível cancelar o agendamento com o status pendente"
    );
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
          <h1 className="text-2xl font-extrabold mb-2 max-w-3xl mx-auto">
            Meus agendamentos
          </h1>

          {/* Table view for larger screens */}
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg max-w-3xl mx-auto hidden sm:block">
            <table className="w-full text-sm text-left text-white dark:text-white">
              <thead className="text-md text-white font-extrabold uppercase bg-logisync-color-blue-300 dark:bg-logisync-color-blue-300 dark:text-white dark:font-extrabold border-b dark:border-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Horário
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Placa
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-gray-700 dark:text-gray-300"
                    >
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : (
                  agendamentos.map((agendamento, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-logisync-color-blue-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b dark:border-gray-500"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium whitespace-nowrap"
                      >
                        {formatDate(agendamento.DataAgendamento)}
                      </th>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium whitespace-nowrap"
                      >
                        {agendamento.HoraAgendamento}
                      </td>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium whitespace-nowrap"
                      >
                        {agendamento.Placa}
                      </td>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium whitespace-nowrap"
                      >
                        {agendamento.SituacaoAgendamento}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          onClick={() => handleAgendamentoClick(agendamento)}
                        >
                          Ver Detalhes
                        </button>
                        {agendamento.SituacaoAgendamento === "Pendente" ? (
                          <button
                            className="font-medium text-red-600 dark:text-red-500 hover:underline ml-4"
                            onClick={() => handleCancelClick(agendamento)}
                          >
                            Cancelar
                          </button>
                        ) : (
                          <button
                            className="font-medium text-gray-400 cursor-not-allowed ml-4"
                            onClick={handleInactiveCancelClick}
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedAgendamento && (
        <Modal
          isOpen={isDetailModalOpen}
          onRequestClose={() => setIsDetailModalOpen(false)}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="flex flex-col items-center bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Detalhes do Agendamento</h2>

            <DadosPessoais usuarioId={Number(user?.id) || 0} />

            <DadosVeicular
              codigoVeiculo={selectedAgendamento.CodigoVeiculo ?? null}
            />

<DadosAgendamento
  dataAgendamento={selectedAgendamento.DataAgendamento}
  horaAgendamento={selectedAgendamento.HoraAgendamento || "N/A"}
  produto={produtoNome || "Produto não disponível"}  // O produto agora será uma string
  quantidade={selectedAgendamento.QuantidadeAgendamento ?? null}
  observacao={selectedAgendamento.Observacao ?? null}
/>


            <DadosPortaria
              codigoPortaria={selectedAgendamento.CodigoAgendamento ?? null}
            />

            <button
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded"
              onClick={() => setIsDetailModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal de Cancelamento */}
      <Modal
        isOpen={isCancelModalOpen}
        onRequestClose={() => setIsCancelModalOpen(false)}
        contentLabel="Confirmar Cancelamento"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="flex flex-col items-center bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar Cancelamento</h2>
          <p className="mb-4">
            Tem certeza que deseja cancelar o agendamento de{" "}
            {selectedAgendamento?.DataAgendamento} às{" "}
            {selectedAgendamento?.HoraAgendamento}?
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
