import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
import Navbar from "../components/Navbar";
import { Agendamento } from "../models/Agendamento";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Modal } from "flowbite-react";
import formatDate from "../../utils/formatDate";
import DadosPessoais from "../components/DadosPessoais";
import DadosVeicular from "../components/DadosVeicular";
import DadosAgendamento from "../components/DadosAgendamento";
import DadosPortaria from "../components/DadosPortaria";
import { getAgendamentosComPlaca } from "../services/agendamentoService"; // Corrigir o caminho conforme necessário
import { getDadosPortaria } from "../services/agendamentoService"; // Certifique-se de importar corretamente

const MeusAgendamentos: React.FC = () => {
  const { user, token, refreshToken, refreshAccessToken } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCancelConfirmModalOpen, setIsCancelConfirmModalOpen] =
    useState(false);
  const [agendamentoToCancel, setAgendamentoToCancel] =
    useState<Agendamento | null>(null);
  const [produtoNome, setProdutoNome] = useState<string>("");
  const [observacaoPortaria, setObservacaoPortaria] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [filtroPlaca, setFiltroPlaca] = useState<string>("");
  const [filtroData, setFiltroData] = useState<string>("");
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<
    Agendamento[]
  >([]);

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

      if (user && token) {
        // Verificação para garantir que `user` não seja `null`
        try {
          const fetchedAgendamentos = await getAgendamentosComPlaca(
            token,
            user.id
          );
          setAgendamentos(fetchedAgendamentos);
          setAgendamentosFiltrados(fetchedAgendamentos);
        } catch (err) {
          toast.error("Erro ao carregar agendamentos.");
        } finally {
          setAuthChecked(true);
          setLoading(false);
        }
      }
    };

    checkAuthAndFetchAgendamentos();
  }, [token, user, refreshToken, refreshAccessToken]);

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    const agendamentosFiltrados = agendamentos.filter((agendamento) => {
      return (
        (filtroStatus
          ? agendamento.SituacaoAgendamento === filtroStatus
          : true) &&
        (filtroPlaca ? agendamento.Placa?.includes(filtroPlaca) : true) &&
        (filtroData ? agendamento.DataAgendamento.includes(filtroData) : true)
      );
    });
    setAgendamentosFiltrados(agendamentosFiltrados);
    setIsFilterModalOpen(false);
  };

  // Função para abrir o modal de detalhes e buscar o nome do produto
  const handleAgendamentoClick = async (agendamento: Agendamento) => {
  
    // Verifica se `CodigoAgendamento` está definido e é um número válido
    if (!agendamento.CodigoAgendamento) {
      console.error("Código de Agendamento não encontrado.");
      return;
    }
  
    try {
      if (token) {
        const portariaData = await getDadosPortaria(agendamento.CodigoAgendamento, token);
  
        setSelectedAgendamento({
          ...agendamento,
          DataHoraSaida: portariaData.DataHoraSaida, // Adicionar o campo de DataHoraSaida
        });
  
        fetchProdutoNome(agendamento.CodigoProduto ?? null);
        setIsDetailModalOpen(true);
        setObservacaoPortaria(portariaData.ObservacaoPortaria ?? "");
      }
    } catch (error) {
      console.error("Erro ao buscar dados da portaria:", error);
      setSelectedAgendamento(agendamento); // Se não encontrar dados, apenas mantenha o agendamento
      setIsDetailModalOpen(true);
      setObservacaoPortaria(agendamento.Observacao ?? "");
    }
  };
  // Função para abrir o modal de confirmação de cancelamento
  const handleCancelClick = (agendamento: Agendamento) => {
    setAgendamentoToCancel(agendamento);
    setIsCancelConfirmModalOpen(true);
  };

  // Função para confirmar o cancelamento do agendamento
  const confirmCancelAgendamento = async () => {
    if (!agendamentoToCancel) return;
    try {
      await api.put(
        `/agendamentos/cancelar/${agendamentoToCancel.CodigoAgendamento}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Agendamento cancelado com sucesso!");
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.CodigoAgendamento === agendamentoToCancel.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Cancelado" }
            : a
        )
      );
      setIsCancelConfirmModalOpen(false);
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
          <h1 className="text-2xl font-extrabold mb-4 max-w-3xl mx-auto">
            Meus agendamentos
          </h1>
          <div className="relative max-w-[70%] mx-auto">
            <div className="flex justify-end mb-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={() => setIsFilterModalOpen(true)}
              >
                Filtros
              </button>
            </div>
          </div>

          {/* Tabela de agendamentos para telas médias e grandes */}
          <div className="hidden sm:block relative max-h-[550px] overflow-x-auto shadow-md sm:rounded-lg max-w-[70%] mx-auto">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
              <thead className="sticky top-0 text-md text-gray-800 font-bold uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:font-bold border-b dark:border-gray-500 z-9">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Horário
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Placa
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {agendamentosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-gray-500 dark:text-gray-300"
                    >
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : (
                  agendamentosFiltrados.map((agendamento, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-900"
                          : "bg-white dark:bg-gray-800"
                      } hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-b dark:border-gray-500 cursor-pointer`}
                      onClick={() => handleAgendamentoClick(agendamento)}
                    >
                      <th
                        scope="row"
                        className="px-4 py-4 font-medium whitespace-nowrap"
                      >
                        {formatDate(agendamento.DataAgendamento)}
                      </th>
                      <td className="px-4 py-4 font-medium whitespace-nowrap">
                        {agendamento.HoraAgendamento}
                      </td>
                      <td className="px-4 py-4 font-medium whitespace-nowrap">
                        {agendamento.Placa}
                      </td>
                      <td className="px-4 py-4 font-medium whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full font-bold ${
                            agendamento.SituacaoAgendamento === "Pendente"
                              ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200"
                              : agendamento.SituacaoAgendamento === "Confirmado"
                              ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                              : agendamento.SituacaoAgendamento === "Cancelado"
                              ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200"
                              : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                          }`}
                        >
                          {agendamento.SituacaoAgendamento}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {agendamento.SituacaoAgendamento === "Pendente" ? (
                          <button
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAgendamentoToCancel(agendamento);
                              setIsCancelConfirmModalOpen(true);
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

          {/* Cartões para dispositivos pequenos */}
          <div className="block sm:hidden grid-cols-1 gap-4 max-w-[90%] mx-auto">
            {agendamentosFiltrados.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-300">
                Nenhum agendamento encontrado.
              </div>
            ) : (
              agendamentosFiltrados.map((agendamento, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700 hover:shadow-lg cursor-pointer"
                  onClick={() => handleAgendamentoClick(agendamento)}
                >
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Data:{" "}
                    <span className="font-normal">
                      {formatDate(agendamento.DataAgendamento)}
                    </span>
                  </p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Horário:{" "}
                    <span className="font-normal">
                      {agendamento.HoraAgendamento}
                    </span>
                  </p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Placa:{" "}
                    <span className="font-normal">{agendamento.Placa}</span>
                  </p>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded-full font-bold ${
                        agendamento.SituacaoAgendamento === "Pendente"
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200"
                          : agendamento.SituacaoAgendamento === "Confirmado"
                          ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200"
                          : agendamento.SituacaoAgendamento === "Cancelado"
                          ? "bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200"
                          : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                      }`}
                    >
                      {agendamento.SituacaoAgendamento}
                    </span>
                  </p>
                  {agendamento.SituacaoAgendamento === "Pendente" && (
                    <button
                      className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAgendamentoToCancel(agendamento);
                        setIsCancelConfirmModalOpen(true);
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modal de Filtros */}
          {isFilterModalOpen && (
            <Modal
              show={isFilterModalOpen}
              size="lg"
              popup={true}
              onClose={() => setIsFilterModalOpen(false)}
              dismissible
              className="fixed inset-0 flex items-start justify-center mt-10"
            >
              <Modal.Header>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Aplicar Filtros
                </h3>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Status
                    </label>
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="">Todos</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Aprovado">Aprovado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={filtroPlaca}
                      onChange={(e) => setFiltroPlaca(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                      placeholder="Digite a placa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Data
                    </label>
                    <input
                      type="date"
                      value={filtroData}
                      onChange={(e) => setFiltroData(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    onClick={() => {
                      setFiltroStatus("");
                      setFiltroPlaca("");
                      setFiltroData("");
                    }}
                  >
                    Limpar
                  </button>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={aplicarFiltros}
                  >
                    Aplicar
                  </button>
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
              </Modal.Body>
            </Modal>
          )}

          {/* Modal de Confirmação de Cancelamento */}
          {isCancelConfirmModalOpen && (
            <Modal
              show={isCancelConfirmModalOpen}
              size="md"
              popup={true}
              onClose={() => setIsCancelConfirmModalOpen(false)}
              dismissible
              className="fixed inset-0 flex items-start justify-center mt-20"
            >
              <Modal.Header>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Confirmar Cancelamento
                </h3>
              </Modal.Header>
              <Modal.Body>
                <p className="text-gray-700 dark:text-gray-300">
                  Tem certeza que deseja cancelar este agendamento?
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    onClick={() => setIsCancelConfirmModalOpen(false)}
                  >
                    Não
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={confirmCancelAgendamento}
                  >
                    Sim, Cancelar
                  </button>
                </div>
              </Modal.Body>
            </Modal>
          )}

          {/* Modal de Detalhes */}
          {selectedAgendamento && (
            <Modal
              show={isDetailModalOpen}
              size="lg"
              popup={true}
              onClose={() => setIsDetailModalOpen(false)}
              dismissible
            >
              <Modal.Header>
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                    Detalhes do Agendamento
                  </h3>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded ml-12"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-6">
                  <DadosPessoais usuarioId={Number(user?.id) || 0} />
                  <DadosVeicular
                    codigoVeiculo={selectedAgendamento?.CodigoVeiculo ?? null}
                  />
                  <DadosAgendamento
                    dataAgendamento={selectedAgendamento?.DataAgendamento}
                    horaAgendamento={
                      selectedAgendamento?.HoraAgendamento || "N/A"
                    }
                    produto={produtoNome || "Produto não disponível"}
                    quantidade={
                      selectedAgendamento?.QuantidadeAgendamento ?? null
                    }
                    observacao={selectedAgendamento?.Observacao ?? null}
                    safra={selectedAgendamento?.AnoSafra ?? "Não informada"}
                    arquivo={selectedAgendamento?.ArquivoAnexado ?? null}
                  />{" "}
             <DadosPortaria
  codigoAgendamento={selectedAgendamento?.CodigoAgendamento ?? null}
  dataHoraSaida={selectedAgendamento?.DataHoraSaida || "N/A"} // Certifique-se de que este valor está correto
  observacaoPortaria={observacaoPortaria}
  setObservacaoPortaria={setObservacaoPortaria}
  isObservacaoEditable={true}
  situacaoAgendamento={selectedAgendamento?.SituacaoAgendamento || "N/A"}
/>

                  {selectedAgendamento.SituacaoAgendamento === "Pendente" && (
                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleCancelClick(selectedAgendamento)}
                    >
                      Cancelar Agendamento
                    </button>
                  )}
                </div>
              </Modal.Body>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

export default MeusAgendamentos;
