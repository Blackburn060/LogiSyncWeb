import React, { useState, useEffect } from "react";
import {
  getAgendamentos,
  updateAgendamentoStatus,
} from "../services/agendamentoService";
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

const AgendamentosAdmin: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null); // Para armazenar o agendamento selecionado
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para o modal de detalhes
  const [motivoRecusa, setMotivoRecusa] = useState<string>(""); // Motivo de recusa
  const [showMotivoInput, setShowMotivoInput] = useState(false); // Mostrar input de recusa
  const [statusFilter, setStatusFilter] = useState<string | null>(null); // Filtro de status
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

  const formatarData = (data: string | Date) => {
    const dataObj = new Date(data);
    return format(dataObj, "eee, dd/MM/yyyy", { locale: ptBR });
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

    // Filtrar agendamentos com base no status
    return agendamentos.filter(
      (agendamento) =>
        agendamento.DataAgendamento === dayString &&
        (!statusFilter || agendamento.SituacaoAgendamento === statusFilter) // Aplicar o filtro de status se estiver ativo
    );
  };

  const handleNextWeek = () => {
    setCurrentStartDate(addDays(currentStartDate, daysToShow));
  };

  const handlePreviousWeek = () => {
    setCurrentStartDate(subDays(currentStartDate, daysToShow));
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
      case "Aguardando":
        return "bg-yellow-500 text-black";
      case "Recusado":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Função para abrir o modal de detalhes
  const handleOpenModal = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgendamento(null);
    setShowMotivoInput(false); // Reseta o campo de recusa quando fecha o modal
  };

  // Função para confirmar o agendamento
  const handleConfirmar = async () => {
    if (selectedAgendamento) {
      try {
        await updateAgendamentoStatus(selectedAgendamento.CodigoAgendamento!, {
          SituacaoAgendamento: "Confirmado",
          TipoAgendamento: selectedAgendamento.TipoAgendamento || "", // Enviando o tipo de agendamento
          MotivoRecusa: "", // Motivo de recusa vazio para confirmação
        });
        alert("Agendamento confirmado com sucesso!");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Erro ao confirmar agendamento:", error);
        alert("Erro ao confirmar o agendamento.");
      }
    }
  };

  // Função para rejeitar o agendamento
  const handleRejeitar = async () => {
    if (selectedAgendamento && motivoRecusa) {
      try {
        await updateAgendamentoStatus(selectedAgendamento.CodigoAgendamento!, {
          SituacaoAgendamento: "Recusado",
          MotivoRecusa: motivoRecusa, // Motivo da recusa informado
        });
        alert("Agendamento recusado com sucesso!");
        setIsModalOpen(false);
      } catch (error) {
        console.error("Erro ao rejeitar agendamento:", error);
        alert("Erro ao rejeitar o agendamento.");
      }
    } else {
      alert("Por favor, informe o motivo da recusa.");
    }
  }; 

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Autorizar Agendamentos</h1>

        {/* Botões de filtro */}
        {/* Botões de filtro */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={() => setStatusFilter(null)} // Use null para o filtro "Todos"
            className={`${
              statusFilter === null // Verifique se o statusFilter é null
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            } px-4 py-2 rounded-lg text-xs md:text-base`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter("Confirmado")}
            className={`${
              statusFilter === "Confirmado"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
            } px-4 py-2 rounded-lg text-xs md:text-base`}
          >
            Confirmado
          </button>
          <button
            onClick={() => setStatusFilter("Aguardando")}
            className={`${
              statusFilter === "Aguardando"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-600"
            } px-4 py-2 rounded-lg text-xs md:text-base`}
          >
            Aguardando
          </button>
          <button
            onClick={() => setStatusFilter("Recusado")}
            className={`${
              statusFilter === "Recusado"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-600"
            } px-4 py-2 rounded-lg text-xs md:text-base`}
          >
            Recusado
          </button>
        </div>

        {/* Controles de navegação */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            &larr; Dias anteriores
          </button>

          {/* Mostrar o ícone de calendário em telas menores e as datas em telas maiores */}
          <span
            className="text-lg font-semibold cursor-pointer flex items-center justify-center"
            onClick={() => setIsCalendarOpen(true)}
          >
            {/* Ocultar as datas em telas menores (sm) e mostrar apenas o ícone */}
            <span className="hidden sm:block">
              {format(currentStartDate, "dd/MM/yyyy")} -{" "}
              {format(addDays(currentStartDate, daysToShow - 1), "dd/MM/yyyy")}
            </span>
            {/* Exibir o ícone de calendário em telas menores */}
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
                d="M8.25 3.75V6M15.75 3.75V6M3 9.75h18M4.5 4.5h15a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0119.5 22.5h-15A2.25 2.25 0 012.25 20.25V6.75A2.25 2.25 0 014.5 4.5z"
              />
            </svg>
          </span>

          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            Próximos dias &rarr;
          </button>
        </div>

        <Modal
          isOpen={isCalendarOpen}
          onRequestClose={() => setIsCalendarOpen(false)}
          className="bg-white rounded-lg p-4 max-w-lg mx-auto my-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          contentLabel="Selecionar Data"
        >
          <DatePicker
            selected={currentStartDate}
            onChange={handleDateChange}
            locale={ptBR}
            inline
          />
        </Modal>

        {/* Modal para exibir detalhes do agendamento */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          className="bg-white rounded-lg p-6 max-w-4xl mx-auto my-auto h-[75%] overflow-y-auto shadow-lg"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          contentLabel="Detalhes do Agendamento"
        >
          {selectedAgendamento && (
            <div className="border p-4 rounded-lg space-y-6">
              <h2 className="text-xl font-bold mb-4 text-center">
                Detalhes do Agendamento
              </h2>

              {/* DADOS PESSOAIS */}
              <div className="border-2 p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-4">DADOS PESSOAIS</h2>
                <DadosPessoais usuarioId={selectedAgendamento.CodigoUsuario} />
              </div>

              {/* DADOS VEICULARES */}
              <div className="border-2 p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-4">DADOS VEICULARES</h2>
                <DadosVeicular
                  codigoVeiculo={selectedAgendamento.CodigoVeiculo}
                />
              </div>

              {/* DADOS DO AGENDAMENTO */}
              <div className="border-2 p-4 rounded-lg">
                <h2 className="text-lg font-bold mb-4">DADOS DO AGENDAMENTO</h2>
                <DadosAgendamentos
                  dataAgendamento={selectedAgendamento?.DataAgendamento ?? ""}
                  horaAgendamento={selectedAgendamento?.HoraAgendamento ?? ""}
                  produto={selectedAgendamento?.Produto ?? ""}
                  quantidade={selectedAgendamento?.Quantidade ?? null}
                  observacao={selectedAgendamento?.Observacao ?? null}
                  safra={selectedAgendamento?.Safra ?? null}
                  arquivo={selectedAgendamento?.Arquivo ?? null}
                />
              </div>

              {/* Se o campo de motivo estiver visível, mostra o campo */}
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
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                  onClick={handleConfirmar}
                >
                  Confirmar
                </button>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {getDaysRange().map((day) => {
              const agendamentosForDay = getAgendamentosForDay(day);
              return (
                <div key={day.toString()} className="border p-4 rounded-lg">
                  <h2 className="text-md font-semibold mb-2 text-center">
                    {formatarData(day)}
                  </h2>
                  <div className="flex flex-col space-y-2">
                    {agendamentosForDay.length === 0 ? (
                      <p className="text-center">Sem agendamentos</p>
                    ) : (
                      agendamentosForDay.map((agendamento) => (
                        <div
                          key={agendamento.CodigoAgendamento}
                          className={`p-2 mb-2 rounded cursor-pointer flex justify-center items-center ${getStatusClass(
                            agendamento.SituacaoAgendamento
                          )}`} // Use flexbox para centralizar o conteúdo
                          onClick={() => handleOpenModal(agendamento)}
                        >
                          <p className="text-sm text-center">
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
