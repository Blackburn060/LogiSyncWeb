import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
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
  const { user, token, refreshToken, refreshAccessToken } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [produtoNome, setProdutoNome] = useState<string>("");

  // Função para buscar o nome do produto com base no CodigoProduto
  const fetchProdutoNome = async (codigoProduto: number | null) => {
    if (codigoProduto) {
      try {
        const response = await api.get(`/produtos/${codigoProduto}`);
        setProdutoNome(
          response.data.DescricaoProduto || "Produto não encontrado"
        );
      } catch (error) {
        console.error("Erro ao carregar dados do produto:", error);
        setProdutoNome("Produto não disponível");
      }
    } else {
      setProdutoNome("Produto não disponível");
    }
  };

  // Função para buscar agendamentos
  useEffect(() => {
    const checkAuthAndFetchAgendamentos = async () => {
      if (!user || !token) {
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

      try {
        const response = await api.get(
          `/agendamentos-com-placa?CodigoUsuario=${user?.id}`
        );
        setAgendamentos(response.data);
      } catch (err) {
        toast.error("Erro ao carregar agendamentos.");
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    checkAuthAndFetchAgendamentos();
  }, [token, user, refreshToken, refreshAccessToken]);

  // Função para abrir o modal de detalhes e buscar o nome do produto
  const handleAgendamentoClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    fetchProdutoNome(agendamento.CodigoProduto ?? null);
    setIsDetailModalOpen(true);
  };

  // Função para cancelar o agendamento
  const cancelAgendamento = async (agendamento: Agendamento) => {
    try {
      await api.put(
        `/agendamentos/cancelar/${agendamento.CodigoAgendamento}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Agendamento cancelado com sucesso!");
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Cancelado" }
            : a
        )
      );
    } catch (error) {
      toast.error("Erro ao cancelar agendamento.");
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Toaster position="top-right" />
        <div className="flex flex-grow justify-center items-center">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex flex-grow justify-center items-center">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="container mx-auto pt-10 flex-grow">
          <h1 className="text-2xl font-extrabold mb-2 max-w-3xl mx-auto">
            Meus agendamentos
          </h1>

          {/* Para telas maiores, mantenha o layout em tabela */}
          <div className="hidden sm:block relative max-h-[550px] overflow-x-auto shadow-md sm:rounded-lg max-w-[70%] mx-auto">
            <table className="w-full text-sm text-left text-white dark:text-white">
              <thead className="sticky top-0 text-md text-white font-extrabold uppercase bg-logisync-color-blue-300 dark:bg-logisync-color-blue-300 dark:text-white dark:font-extrabold border-b dark:border-gray-500 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3 w-1/4 sm:w-auto">Data</th>
                  <th scope="col" className="px-4 py-3 w-1/4 sm:w-auto">Horário</th>
                  <th scope="col" className="px-4 py-3 w-1/4 sm:w-auto">Placa</th>
                  <th scope="col" className="px-4 py-3 w-1/4 sm:w-auto">Status</th>
                  <th scope="col" className="px-4 py-3 w-1/4 sm:w-auto">Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-700 dark:text-gray-300">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : (
                  agendamentos.map((agendamento, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-logisync-color-blue-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b dark:border-gray-500 cursor-pointer hover:bg-logisync-color-blue-100"
                      onClick={() => handleAgendamentoClick(agendamento)}
                    >
                      <th scope="row" className="px-4 py-4 font-medium whitespace-nowrap">
                        {formatDate(agendamento.DataAgendamento)}
                      </th>
                      <td scope="row" className="px-4 py-4 font-medium whitespace-nowrap">
                        {agendamento.HoraAgendamento}
                      </td>
                      <td scope="row" className="px-4 py-4 font-medium whitespace-nowrap">
                        {agendamento.Placa}
                      </td>
                      <td scope="row" className="px-4 py-4 font-medium whitespace-nowrap">
                        {agendamento.SituacaoAgendamento}
                      </td>
                      <td className="px-4 py-4">
                        {agendamento.SituacaoAgendamento === "Pendente" ? (
                          <button
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelAgendamento(agendamento);
                            }}
                          >
                            Cancelar
                          </button>
                        ) : (
                          <button
                            className="font-medium text-gray-400 cursor-not-allowed"
                            onClick={(e) => e.stopPropagation()}
                            disabled
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

          {/* Em telas pequenas, transforme em cartões */}
          <div className="sm:hidden grid grid-cols-1 gap-4 mx-auto">
            {agendamentos.length === 0 ? (
              <p className="text-center py-4 text-gray-700 dark:text-gray-300">
                Nenhum agendamento encontrado.
              </p>
            ) : (
              agendamentos.map((agendamento, index) => (
                <div
                  key={index}
                  className="bg-gray-800 text-white p-4 rounded-lg shadow-md hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleAgendamentoClick(agendamento)}
                >
                  <p><strong>Data:</strong> {formatDate(agendamento.DataAgendamento)}</p>
                  <p><strong>Horário:</strong> {agendamento.HoraAgendamento}</p>
                  <p><strong>Placa:</strong> {agendamento.Placa}</p>
                  <p><strong>Status:</strong> {agendamento.SituacaoAgendamento}</p>
                  {agendamento.SituacaoAgendamento === "Pendente" ? (
                    <button
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelAgendamento(agendamento);
                      }}
                    >
                      Cancelar
                    </button>
                  ) : (
                    <button
                      className="font-medium text-gray-400 cursor-not-allowed"
                      onClick={(e) => e.stopPropagation()}
                      disabled
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedAgendamento && (
        <Modal
          isOpen={isDetailModalOpen}
          onRequestClose={() => setIsDetailModalOpen(false)}
          shouldCloseOnOverlayClick={true}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
          onAfterOpen={() => document.body.classList.add("overflow-hidden")}
          onAfterClose={() => document.body.classList.remove("overflow-hidden")}
          ariaHideApp={false}
        >
          <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full h-auto max-h-[90vh] overflow-y-auto">
            {/* Botão de Fechar com Fundo Vermelho e X */}
            <button
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setIsDetailModalOpen(false)}
            >
              X
            </button>

            {/* Título e Status */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                Detalhes do Agendamento 
                <span
                  className={`ml-4 ${
                    selectedAgendamento?.SituacaoAgendamento === "Pendente"
                      ? "bg-yellow-400"
                      : selectedAgendamento?.SituacaoAgendamento === "Cancelado"
                      ? "bg-red-500"
                      : "bg-green-500"
                  } text-white text-sm font-bold py-1 px-4 rounded-full`}
                >
                  {selectedAgendamento?.SituacaoAgendamento}
                </span>
              </h2>
            </div>

            {/* Dados Pessoais */}
            <DadosPessoais usuarioId={Number(user?.id) || 0} />

            {/* Dados Veicular */}
            <DadosVeicular codigoVeiculo={selectedAgendamento?.CodigoVeiculo ?? null} />

            {/* Dados Agendamento */}
            <DadosAgendamento
              dataAgendamento={selectedAgendamento?.DataAgendamento}
              horaAgendamento={selectedAgendamento?.HoraAgendamento || "N/A"}
              produto={produtoNome || "Produto não disponível"}
              quantidade={selectedAgendamento?.QuantidadeAgendamento ?? null}
              observacao={selectedAgendamento?.Observacao ?? null}
            />

            {/* Dados da Portaria */}
            <DadosPortaria codigoAgendamento={selectedAgendamento?.CodigoAgendamento ?? null} dataHoraSaida={""} />

            {/* Botão de Cancelar */}
            {selectedAgendamento.SituacaoAgendamento === "Pendente" && (
              <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => cancelAgendamento(selectedAgendamento)}
              >
                Cancelar Agendamento
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MeusAgendamentos;
