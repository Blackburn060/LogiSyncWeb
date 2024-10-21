import React, { useState, useEffect } from "react";
import { updateAgendamentoStatus } from "../services/agendamentoService";
import { Agendamento } from "../models/Agendamento";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"; // Importando useAuth
import DadosPessoais from "../components/DadosPessoais";
import DadosVeicular from "../components/DadosVeicular";
import DadosAgendamentos from "../components/DadosAgendamento";
import Modal from "react-modal";
import { addDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import DatePicker from "react-datepicker";
import toast, { Toaster } from "react-hot-toast";
import { getAgendamentosAdmin } from "../services/agendamentoService";

import "react-datepicker/dist/react-datepicker.css";

// SVG de seta comparativa
export function FunnelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 4h18l-8 8v5l-4 4v-9L3 4z" />
    </svg>
  );
}

export function IcOutlineCalendarMonth(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 16H5V10h14zm0-12H5V6h14zM9 14H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2zm-8 4H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2z"
      />
    </svg>
  );
}

export function IcRoundRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M17.65 6.35a7.95 7.95 0 0 0-6.48-2.31c-3.67.37-6.69 3.35-7.1 7.02C3.52 15.91 7.27 20 12 20a7.98 7.98 0 0 0 7.21-4.56c.32-.67-.16-1.44-.9-1.44c-.37 0-.72.2-.88.53a5.994 5.994 0 0 1-6.8 3.31c-2.22-.49-4.01-2.3-4.48-4.52A6.002 6.002 0 0 1 12 6c1.66 0 3.14.69 4.22 1.78l-1.51 1.51c-.63.63-.19 1.71.7 1.71H19c.55 0 1-.45 1-1V6.41c0-.89-1.08-1.34-1.71-.71z"
      />
    </svg>
  );
}

// Função para controlar a rolagem da página quando o modal estiver aberto
const toggleBodyScroll = (isModalOpen: boolean) => {
  if (isModalOpen) {
    document.body.style.overflow = "hidden"; // Impede a rolagem
  } else {
    document.body.style.overflow = ""; // Restaura a rolagem
  }
};

// Componente principal
const AgendamentosAdmin: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth(); // Usando token do contexto de autenticação
  const [loading, setLoading] = useState<boolean>(true); // Declaração de loading e setLoading

  const [motivoRecusa, setMotivoRecusa] = useState<string>("");
  const [showMotivoInput, setShowMotivoInput] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false); // Filtro dropdown

  const daysToShow = 7;

  // Efeito para desativar a rolagem quando o modal estiver aberto
  useEffect(() => {
    toggleBodyScroll(isModalOpen); // Desativa a rolagem quando o modal estiver aberto
    return () => toggleBodyScroll(false); // Garante que a rolagem seja restaurada ao desmontar o componente
  }, [isModalOpen]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true); // Ativa o estado de loading ao iniciar a busca dos agendamentos
        const data = await getAgendamentosAdmin(token!); // Chama o novo service que você definiu
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos admin:", error);
      } finally {
        setLoading(false); // Desativa o estado de loading após finalizar a busca
      }
    };

    fetchAgendamentos();
  }, [token]);

  const countFuturePendingAgendamentos = () => {
    const lastDayShown = addDays(currentStartDate, daysToShow - 1);
    return agendamentos.filter(
      (agendamento) =>
        agendamento.SituacaoAgendamento === "Pendente" &&
        new Date(agendamento.DataAgendamento) > lastDayShown
    ).length;
  };

  const formatarData = (data: string | Date) => {
    const dataObj = new Date(data);
    return format(dataObj, "eee, dd/MM/yyyy", { locale: ptBR });
  };

  const getFilteredDays = () => {
    return getDaysRange();
  };

  const getDaysRange = () => {
    const days = [];
    for (let i = 0; i < daysToShow; i++) {
      const day = addDays(currentStartDate, i);
      days.push(day);
    }
    return days;
  };

  const getAgendamentosForDay = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");

    return agendamentos.filter(
      (agendamento) =>
        agendamento.DataAgendamento === dayString &&
        (!statusFilter || agendamento.SituacaoAgendamento === statusFilter)
    );
  };

  const handleNextWeek = () => {
    setCurrentStartDate(addDays(currentStartDate, daysToShow));
  };

  const handlePreviousWeek = () => {
    setCurrentStartDate(subDays(currentStartDate, daysToShow));
  };

  const voltarParaHoje = () => {
    setCurrentStartDate(new Date());
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentStartDate(date);
    }
    setIsCalendarOpen(false);
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Confirmado":
        return "bg-green-500 text-white";
      case "Pendente":
        return "bg-yellow-500 text-black";
      case "Recusado":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleOpenModal = (agendamento: Agendamento) => {
    setSelectedAgendamento({
      ...agendamento,
      DescricaoProduto:
        agendamento.DescricaoProduto || "Produto não disponível",
      AnoSafra: agendamento.AnoSafra || "Safra não disponível",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgendamento(null);
    setShowMotivoInput(false);
  };

  const handleConfirmar = async () => {
    if (selectedAgendamento) {
      try {
        const observacao = selectedAgendamento.Observacao || ""; // Define a observação corretamente

        await updateAgendamentoStatus(
          selectedAgendamento.CodigoAgendamento!,
          {
            SituacaoAgendamento: "Confirmado",
            TipoAgendamento: selectedAgendamento.TipoAgendamento || "",
            Observacao: observacao, // Passa a observação para a função de atualização
          },
          token!
        );

        setAgendamentos((prevAgendamentos) =>
          prevAgendamentos.map((agendamento) =>
            agendamento.CodigoAgendamento ===
            selectedAgendamento.CodigoAgendamento
              ? {
                  ...agendamento,
                  SituacaoAgendamento: "Confirmado",
                  Observacao: observacao,
                }
              : agendamento
          )
        );

        toast.success("Agendamento confirmado com sucesso!");
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao confirmar agendamento:", error);
        toast.error("Erro ao confirmar o agendamento.");
      }
    }
  };

  const handleRejeitar = async () => {
    if (selectedAgendamento && motivoRecusa) {
      try {
        await updateAgendamentoStatus(
          selectedAgendamento.CodigoAgendamento!,
          {
            SituacaoAgendamento: "Recusado",
            MotivoRecusa: motivoRecusa,
            TipoAgendamento: selectedAgendamento.TipoAgendamento || "",
            Observacao: selectedAgendamento.Observacao || "Sem observação",
          },
          token!
        );

        setAgendamentos((prevAgendamentos) =>
          prevAgendamentos.map((agendamento) =>
            agendamento.CodigoAgendamento ===
            selectedAgendamento.CodigoAgendamento
              ? {
                  ...agendamento,
                  SituacaoAgendamento: "Recusado",
                  MotivoRecusa: motivoRecusa,
                  Observacao:
                    selectedAgendamento.Observacao || "Sem observação",
                }
              : agendamento
          )
        );

        toast.success("Agendamento recusado com sucesso!");
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao rejeitar agendamento:", error);
        toast.error("Erro ao rejeitar o agendamento.");
      }
    } else {
      toast.error("Por favor, informe o motivo da recusa.");
    }
  };

  const handleFilterByStatus = (status: string | null) => {
    setStatusFilter(status);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Toaster position="top-right" reverseOrder={false} />

      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousWeek}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            <span className="block md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </span>
            <span className="hidden md:block">&larr; Dias anteriores</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={voltarParaHoje}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
            >
              <IcRoundRefresh width={20} height={20} />
            </button>

            <div
              className="text-lg font-semibold cursor-pointer flex items-center"
              onClick={() => setIsCalendarOpen(true)}
            >
              <button className="block md:hidden p-2 bg-blue-500 text-white rounded-lg">
                <IcOutlineCalendarMonth width={24} height={24} />
              </button>

              <span className="hidden md:block">
                {format(currentStartDate, "dd/MM/yyyy")} -{" "}
                {format(
                  addDays(currentStartDate, daysToShow - 1),
                  "dd/MM/yyyy"
                )}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={toggleFilterDropdown}
                className="relative p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <FunnelIcon className="w-6 h-6" />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <ul className="py-1">
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus(null)}
                    >
                      Todos
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus("Pendente")}
                    >
                      Pendente
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus("Confirmado")}
                    >
                      Confirmado
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus("Recusado")}
                    >
                      Recusado
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus("Andamento")}
                    >
                      Andamento
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus("Finalizado")}
                    >
                      Finalizado
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterByStatus("Reprovado")}
                    >
                      Reprovado
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleNextWeek}
            className="relative flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            <span className="block md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </span>
            <span className="hidden md:block">Próximos dias &rarr;</span>

            {countFuturePendingAgendamentos() > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {countFuturePendingAgendamentos()}
              </span>
            )}
          </button>
        </div>

        <Modal
          isOpen={isCalendarOpen}
          onRequestClose={() => setIsCalendarOpen(false)}
          className="bg-white rounded-lg p-4 max-w-xs mx-auto my-auto shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          contentLabel="Selecionar Data"
        >
          <DatePicker
            selected={currentStartDate}
            onChange={handleDateChange}
            locale={ptBR}
            inline
            calendarClassName="w-full"
          />
        </Modal>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          className="bg-white rounded-lg p-6 max-w-lg mx-auto my-auto shadow-lg max-h-screen overflow-y-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
          bodyOpenClassName="overflow-hidden"
          contentLabel="Detalhes do Agendamento"
        >
          {selectedAgendamento && (
            <div className="p-1 space-y-2 relative">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h2 className="text-xl font-bold">Detalhes do Agendamento</h2>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${getStatusClass(
                      selectedAgendamento.SituacaoAgendamento
                    )}`}
                  >
                    {selectedAgendamento.SituacaoAgendamento}
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 transition duration-200 ease-in-out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="border-2 p-2 rounded-lg mb-2">
                <DadosPessoais usuarioId={selectedAgendamento.CodigoUsuario} />
              </div>
              <div className="border-2 p-2 rounded-lg mb-2">
                <DadosVeicular
                  codigoVeiculo={selectedAgendamento.CodigoVeiculo}
                />
              </div>
              <div className="border-2 p-2 rounded-lg mb-2">
                <DadosAgendamentos
                  dataAgendamento={selectedAgendamento?.DataAgendamento ?? ""}
                  horaAgendamento={selectedAgendamento?.HoraAgendamento ?? ""}
                  produto={selectedAgendamento?.DescricaoProduto ?? ""}
                  quantidade={
                    selectedAgendamento?.QuantidadeAgendamento ?? null
                  }
                  observacao={selectedAgendamento?.Observacao ?? null}
                  safra={selectedAgendamento?.AnoSafra ?? ""}
                  arquivo={selectedAgendamento?.ArquivoAnexado ?? null}
                  editable={
                    selectedAgendamento?.SituacaoAgendamento === "Pendente"
                  }
                  onProdutoChange={(value) =>
                    setSelectedAgendamento((prev) =>
                      prev ? { ...prev, CodigoProduto: Number(value) } : prev
                    )
                  }
                  onQuantidadeChange={(value) =>
                    setSelectedAgendamento((prev) =>
                      prev ? { ...prev, QuantidadeAgendamento: value } : prev
                    )
                  }
                  onSafraChange={(value) =>
                    setSelectedAgendamento((prev) =>
                      prev ? { ...prev, CodigoSafra: Number(value) } : prev
                    )
                  }
                />
              </div>
              {showMotivoInput && (
                <div className="mt-3">
                  <label className="block mb-2">Motivo da Recusa:</label>
                  <textarea
                    className="border p-2 rounded w-full"
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    placeholder="Descreva o motivo da recusa"
                  />
                </div>
              )}
              <div className="flex justify-between mt-6">
                {selectedAgendamento?.SituacaoAgendamento === "Pendente" && (
                  <>
                    {!showMotivoInput ? (
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                        onClick={handleConfirmar}
                      >
                        Confirmar
                      </button>
                    ) : (
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                        onClick={() => setShowMotivoInput(false)}
                      >
                        Cancelar
                      </button>
                    )}

                    {!showMotivoInput ? (
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                        onClick={() => setShowMotivoInput(true)}
                      >
                        Rejeitar
                      </button>
                    ) : (
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                        onClick={handleRejeitar}
                      >
                        Confirmar Rejeição
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <l-helix size="45" speed="2.5" color="black"></l-helix>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4`}
          >
            {getFilteredDays().map((day, dayIndex) => {
              const agendamentosForDay = getAgendamentosForDay(day);
              return (
                <div
                  key={`day-${dayIndex}`} // Chave única para cada dia
                  className="border p-4 rounded-lg bg-white shadow-md"
                >
                  <h2 className="text-md font-semibold mb-2 text-center text-gray-700">
                    {formatarData(day)}
                  </h2>
                  <div className="flex flex-col space-y-2">
                    {agendamentosForDay.length === 0 ? (
                      <p className="text-center text-gray-400">
                        Sem agendamentos
                      </p>
                    ) : (
                      agendamentosForDay.map(
                        (agendamento, agendamentoIndex) => (
                          <div
                            key={`agendamento-${agendamento.CodigoAgendamento}-${agendamentoIndex}`} // Usa CodigoAgendamento e o índice para garantir exclusividade
                            className={`p-2 mb-2 rounded cursor-pointer flex justify-center items-center ${getStatusClass(
                              agendamento.SituacaoAgendamento
                            )} shadow`}
                            onClick={() => handleOpenModal(agendamento)}
                          >
                            <p className="text-sm text-center text-white">
                              {agendamento.TipoAgendamento ||
                                "Tipo não especificado"}{" "}
                              <span className="text-xs">
                                | {agendamento.HoraAgendamento}
                              </span>
                            </p>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamentosAdmin;
