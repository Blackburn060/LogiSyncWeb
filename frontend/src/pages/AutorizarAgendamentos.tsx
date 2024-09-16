import React, { useState, useEffect, SVGProps } from "react";
import {
  getAgendamentos,
  updateAgendamentoStatus,
  getProdutoByCodigo, // Adicionando essa função
  getSafraByCodigo, // Adicionando essa função
} from "../services/agendamentoService"; // Importando as funções corretamente
import { Agendamento } from "../models/Agendamento";
import Navbar from "../components/Navbar";
import DadosPessoais from "../components/DadosPessoais";
import DadosVeicular from "../components/DadosVeicular";
import DadosAgendamentos from "../components/DadosAgendamento";
import Modal from "react-modal";
import { addDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

// SVG de seta comparativa
export function IcBaselineCompareArrows(props: SVGProps<SVGSVGElement>) {
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
        d="M9.01 14H2v2h7.01v3L13 15l-3.99-4zm5.98-1v-3H22V8h-7.01V5L11 9z"
      ></path>
    </svg>
  );
}

// Componente principal
const AgendamentosAdmin: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState<string>("");
  const [showMotivoInput, setShowMotivoInput] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const daysToShow = 7;

  useEffect(() => {
    const fetchAgendamentos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token não encontrado");
        }
        const agendamentosData = await getAgendamentos(token);
        setAgendamentos(agendamentosData);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [currentStartDate]);

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
    const allDays = getDaysRange();
    return allDays;
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

  const handleGoToToday = () => {
    setCurrentStartDate(new Date());
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentStartDate(date);
    }
    setIsCalendarOpen(false);
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

  const handleOpenModal = async (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento); // Define o agendamento selecionado inicialmente
    setIsModalOpen(true); // Abre o modal

    try {
      // Buscar a descrição do produto, se existir
      if (agendamento.CodigoProduto) {
        const produtoDescricao = await getProdutoByCodigo(
          agendamento.CodigoProduto
        );
        setSelectedAgendamento((prev) =>
          prev ? { ...prev, DescricaoProduto: produtoDescricao } : prev
        );
      }

      // Buscar o ano da safra, se existir
      if (agendamento.CodigoSafra) {
        const safraAno = await getSafraByCodigo(agendamento.CodigoSafra);
        setSelectedAgendamento((prev) =>
          prev ? { ...prev, AnoSafra: safraAno } : prev
        );
      }
    } catch (error) {
      console.error("Erro ao buscar Produto ou Safra:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgendamento(null);
    setShowMotivoInput(false);
  };

  const handleConfirmar = async () => {
    if (selectedAgendamento) {
      try {
        await updateAgendamentoStatus(selectedAgendamento.CodigoAgendamento!, {
          SituacaoAgendamento: "Confirmado",
          TipoAgendamento: selectedAgendamento.TipoAgendamento || "",
          MotivoRecusa: "",
        });

        // Atualiza o estado do agendamento para "Confirmado"
        setAgendamentos((prevAgendamentos) =>
          prevAgendamentos.map((agendamento) =>
            agendamento.CodigoAgendamento ===
            selectedAgendamento.CodigoAgendamento
              ? { ...agendamento, SituacaoAgendamento: "Confirmado" }
              : agendamento
          )
        );

        alert("Agendamento confirmado com sucesso!");
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao confirmar agendamento:", error);
        alert("Erro ao confirmar o agendamento.");
      }
    }
  };

  const handleRejeitar = async () => {
    if (selectedAgendamento && motivoRecusa) {
      try {
        await updateAgendamentoStatus(selectedAgendamento.CodigoAgendamento!, {
          SituacaoAgendamento: "Recusado",
          MotivoRecusa: motivoRecusa,
        });

        // Atualiza o estado do agendamento para "Recusado"
        setAgendamentos((prevAgendamentos) =>
          prevAgendamentos.map((agendamento) =>
            agendamento.CodigoAgendamento ===
            selectedAgendamento.CodigoAgendamento
              ? { ...agendamento, SituacaoAgendamento: "Recusado" }
              : agendamento
          )
        );

        alert("Agendamento recusado com sucesso!");
        handleCloseModal();
      } catch (error) {
        console.error("Erro ao rejeitar agendamento:", error);
        alert("Erro ao rejeitar o agendamento.");
      }
    } else {
      alert("Por favor, informe o motivo da recusa.");
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterByStatus = (status: string | null) => {
    setStatusFilter(status);
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">
            Autorizar Agendamentos
          </h1>
          <button
            onClick={handleGoToToday}
            className="p-2 rounded-full bg-white hover:bg-gray-400 transition duration-200 ease-in-out shadow-md"
          >
            <IcBaselineCompareArrows className="w-8 h-8 text-gray-600" />
          </button>
        </div>

        <div className="relative mb-6">
          <button
            onClick={toggleFilter}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition"
          >
            <span className="hidden sm:block">Filtrar por status</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 ml-2 sm:ml-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4.5h18M9.75 9.75h4.5l3.75 7.5H6l3.75-7.5z"
              />
            </svg>
          </button>

          {isFilterOpen && (
            <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleFilterByStatus(null)}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Todos
              </button>
              <button
                onClick={() => handleFilterByStatus("Confirmado")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Confirmado
              </button>
              <button
                onClick={() => handleFilterByStatus("Pendente")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Pendente
              </button>
              <button
                onClick={() => handleFilterByStatus("Recusado")}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Recusado
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            &larr; Dias anteriores
          </button>

          <span
            className="text-lg font-semibold cursor-pointer flex items-center justify-center hover:text-blue-500 transition"
            onClick={() => setIsCalendarOpen(true)}
          >
            <span className="hidden sm:block">
              {format(currentStartDate, "dd/MM/yyyy")} -{" "}
              {format(addDays(currentStartDate, daysToShow - 1), "dd/MM/yyyy")}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 block sm:hidden"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 3.75V6M15.75 3.75V6M3 9.75h18M4.5 4.5h15a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0119.5 22.5h-15A2.25 2.25 0 014.5 4.5z"
              />
            </svg>
          </span>

          <button
            onClick={handleNextWeek}
            className="relative px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            Próximos dias &rarr;
            {countFuturePendingAgendamentos() > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {countFuturePendingAgendamentos()}
              </span>
            )}
          </button>
        </div>

        {/* Modal de Seleção de Data */}
        <Modal
          isOpen={isCalendarOpen}
          onRequestClose={() => setIsCalendarOpen(false)}
          className="bg-white rounded-lg p-4 max-w-xs mx-auto my-auto shadow-lg" // Modifique "max-w-lg" para "max-w-xs"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          contentLabel="Selecionar Data"
        >
          <DatePicker
            selected={currentStartDate}
            onChange={handleDateChange}
            locale={ptBR}
            inline
            calendarClassName="w-full" // Garanta que o calendário ocupe toda a largura disponível
          />
        </Modal>

        {/* Modal com ajuste de z-index e overlay cobrindo a tela */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          className="bg-white rounded-lg p-6 max-w-lg mx-auto my-auto shadow-lg max-h-screen overflow-y-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
          bodyOpenClassName="overflow-hidden"
          contentLabel="Detalhes do Agendamento"
        >
          {selectedAgendamento && (
            <div className="border p-4 rounded-lg space-y-6 relative">
              {/* Título e botão de fechar */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Detalhes do Agendamento</h2>
                {/* Botão de fechar */}
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

              {/* Conteúdo do modal */}
              <div className="border-2 p-4 rounded-lg">
                <DadosPessoais usuarioId={selectedAgendamento.CodigoUsuario} />
              </div>

              <div className="border-2 p-4 rounded-lg">
                <DadosVeicular
                  codigoVeiculo={selectedAgendamento.CodigoVeiculo}
                />
              </div>
              <div className="border-2 p-4 rounded-lg">
                <DadosAgendamentos
                  dataAgendamento={selectedAgendamento?.DataAgendamento ?? ""}
                  horaAgendamento={selectedAgendamento?.HoraAgendamento ?? ""}
                  produto={selectedAgendamento?.DescricaoProduto ?? ""} // Nome do produto
                  quantidade={
                    selectedAgendamento?.QuantidadeAgendamento ?? null
                  }
                  observacao={selectedAgendamento?.Observacao ?? null}
                  safra={selectedAgendamento?.AnoSafra ?? ""} // Ano da safra
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
                <div className="mt-4">
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
              </div>
            </div>
          )}
        </Modal>

        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4`}
          >
            {getFilteredDays().map((day) => {
              const agendamentosForDay = getAgendamentosForDay(day);
              return (
                <div
                  key={day.toString()}
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
                      agendamentosForDay.map((agendamento) => (
                        <div
                          key={agendamento.CodigoAgendamento}
                          className={`p-2 mb-2 rounded cursor-pointer flex justify-center items-center ${getStatusClass(
                            agendamento.SituacaoAgendamento
                          )} shadow`}
                          onClick={() => handleOpenModal(agendamento)}
                        >
                          <p className="text-sm text-center text-white">
                            {agendamento.TipoAgendamento}{" "}
                            <span className="text-xs">
                              | {agendamento.HoraAgendamento}
                            </span>
                          </p>
                        </div>
                      ))
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
