import React, { useState, useEffect } from "react";
import {
  getAgendamentosPorStatus,
  finalizarAgendamento,
  aprovarAgendamento,
  recusarAgendamento,
} from "../services/portariaService";
import toast, { Toaster } from "react-hot-toast";
import { Agendamento } from "../models/Agendamento";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import Modal from "react-modal";
import { addDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import DadosVeicular from "../components/DadosVeicular";
import DadosPessoais from "../components/DadosPessoais";
import DadosAgendamentos from "../components/DadosAgendamento";
import DadosPortaria from "../components/DadosPortaria";
import "react-datepicker/dist/react-datepicker.css"; // Importa o CSS do Datepicker
import DatePicker from "react-datepicker"; // Importa o componente DatePicker
import { getDadosPortaria } from "../services/portariaService";

// Aqui está o seu ícone personalizado
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
      ></path>
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

// Função para controlar a rolagem da página quando qualquer modal estiver aberto
const toggleBodyScroll = (isModalOpen: boolean) => {
  if (isModalOpen) {
    document.body.style.overflow = "hidden"; // Impede a rolagem da página
  } else {
    document.body.style.overflow = ""; // Restaura a rolagem da página
  }
};

// Função que retorna a cor de fundo de acordo com o status do agendamento
const getStatusColor = (status: string) => {
  switch (status) {
    case "Confirmado":
      return "bg-green-500";
    case "Reprovado":
      return "bg-orange-500";
    case "Andamento":
      return "bg-yellow-500";
    case "Finalizado":
      return "bg-gray-500";
    default:
      return "bg-orange-500";
  }
};

const Portaria: React.FC = () => {
  const { token, user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecusaModalOpen, setIsRecusaModalOpen] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [observacaoPortaria, setObservacaoPortaria] = useState(""); // Observação para o campo da portaria
  const [loading, setLoading] = useState<boolean>(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false); // Controla a exibição do modal do calendário
  const [filterStatus, setFilterStatus] = useState<string>("Todos"); // Filtro de status
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false); // Controla o dropdown de filtro

  const daysToShow = 7;

  useEffect(() => {
    // O scroll será bloqueado se qualquer um dos modais estiver aberto
    toggleBodyScroll(isModalOpen || isRecusaModalOpen || isCalendarModalOpen);
    return () => toggleBodyScroll(false); // Certifique-se de limpar quando o componente desmontar
  }, [isModalOpen, isRecusaModalOpen, isCalendarModalOpen]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        const data = await getAgendamentosPorStatus(token!);
        setAgendamentos(data);
      } catch (error) {
        toast.error("Erro ao buscar agendamentos.");
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [token, currentStartDate]);

  const voltarParaHoje = () => {
    setCurrentStartDate(new Date()); // Define o dia atual no estado
  };

  // Toggle para abrir/fechar o dropdown
  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setIsFilterDropdownOpen(false); // Fecha o dropdown ao selecionar um filtro
  };

  const FunnelIcon = ({ onClick }: { onClick: () => void }) => {
    return (
      <svg
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 11.414V16a1 1 0 01-.293.707l-2 2A1 1 0 0110 18v-6.586L3.293 6.707A1 1 0 013 6V4z"
        />
      </svg>
    );
  };

  const handleFinalizarAgendamento = async (agendamento: Agendamento) => {
    try {
      const dataHoraSaida = new Date().toISOString();

      // Chama o service para finalizar o agendamento
      await finalizarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        agendamento.TipoAgendamento!,
        agendamento.Observacao ?? "Sem observação" // Passe a observação do agendamento (ou "Sem observação" se estiver vazia)
      );

      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Finalizado" }
            : a
        )
      );

      setSelectedAgendamento((prevAgendamento) =>
        prevAgendamento
          ? {
              ...prevAgendamento,
              DadosPortaria: {
                ...prevAgendamento.DadosPortaria,
                DataHoraSaida: dataHoraSaida,
              },
            }
          : null
      );

      handleCloseModal();
      toast.success("Agendamento finalizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao finalizar o agendamento.");
      console.error("Erro ao finalizar o agendamento:", error);
    }
  };

  const handleAprovarAgendamento = async (agendamento: Agendamento) => {
    try {
      const usuarioId = Number(user!.id);

      // Aprovar o agendamento e enviar a observação da portaria
      await aprovarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        agendamento.TipoAgendamento!,
        usuarioId,
        observacaoPortaria // Observação da portaria passada aqui
      );

      toast.success("Agendamento aprovado com sucesso!");
      handleCloseModal();

      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? {
                ...a,
                SituacaoAgendamento: "Andamento",
                Observacao: agendamento.Observacao || "Sem observação", // Atualiza também a observação localmente
              }
            : a
        )
      );
    } catch (error) {
      toast.error("Erro ao aprovar o agendamento.");
      console.error("Erro ao aprovar o agendamento:", error);
    }
  };

  const handleRecusarAgendamento = async (agendamento: Agendamento | null) => {
    if (!agendamento) {
      toast.error("Nenhum agendamento selecionado.");
      return;
    }

    try {
      const usuarioId = Number(user!.id);

      if (!motivoRecusa) {
        toast.error("Motivo de recusa é necessário.");
        return;
      }

      await recusarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        motivoRecusa,
        usuarioId,
        agendamento.TipoAgendamento!
      );

      toast.success("Agendamento recusado com sucesso!");
      handleCloseRecusaModal();
      handleCloseModal();

      // Atualizar o estado do agendamento com "Reprovado" em vez de "Recusado"
      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? {
                ...a,
                SituacaoAgendamento: "Reprovado", // Alterar para "Reprovado"
                MotivoRecusa: motivoRecusa,
              }
            : a
        )
      );
    } catch (error) {
      toast.error("Erro ao recusar o agendamento.");
      console.error("Erro ao recusar o agendamento:", error);
    }
  };

  const handleOpenModal = async (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setObservacaoPortaria(""); // Resetar observação

    try {
      const dadosPortaria = await getDadosPortaria(
        token!,
        agendamento.CodigoAgendamento!
      );

      setSelectedAgendamento((prevAgendamento) => {
        if (!prevAgendamento) return null;

        return {
          ...prevAgendamento,
          DataHoraSaida: dadosPortaria?.DataHoraSaida || "N/A",
          DadosPortaria: {
            ...prevAgendamento.DadosPortaria,
            ...dadosPortaria,
          },
        };
      });
    } catch (error) {
      toast.error("Erro ao buscar dados da portaria.");
      console.error("Erro ao buscar dados da portaria:", error);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgendamento(null);
  };

  const handleOpenRecusaModal = () => {
    if (!selectedAgendamento) {
      toast.error("Nenhum agendamento selecionado.");
      return;
    }
    setIsRecusaModalOpen(true);
  };

  const handleCloseRecusaModal = () => {
    setIsRecusaModalOpen(false);
    setMotivoRecusa("");
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
        (filterStatus === "Todos" ||
          agendamento.SituacaoAgendamento === filterStatus)
    );
  };

  const handleNextWeek = () => {
    setCurrentStartDate(addDays(currentStartDate, daysToShow));
  };

  const handlePreviousWeek = () => {
    setCurrentStartDate(subDays(currentStartDate, daysToShow));
  };

  const formatarData = (data: Date) => {
    return format(data, "eee, dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster />
      <div className="container mx-auto p-4">
        {/* Navegação entre semanas */}
        <div className="flex justify-between items-center mb-6">
          {/* Botão de "Dias Anteriores" */}
          <button
            onClick={handlePreviousWeek}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            {/* Exibe ícone em telas pequenas */}
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
            {/* Exibe texto em telas maiores */}
            <span className="hidden md:block">&larr; Dias anteriores</span>
          </button>

          {/* Contêiner central com data e botões */}
          <div className="flex items-center space-x-4">
            {/* Botão de voltar para a data atual */}
            <button
              onClick={voltarParaHoje}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
            >
              <IcRoundRefresh width={20} height={20} /> {/* Ícone da seta */}
            </button>

            {/* Data central */}
            <div
              className="text-lg font-semibold cursor-pointer flex items-center"
              onClick={() => setIsCalendarModalOpen(true)} // Abre o modal do calendário
            >
              {/* Exibe o ícone de calendário em telas pequenas */}
              <button className="block md:hidden p-2 bg-blue-500 text-white rounded-lg">
                <IcOutlineCalendarMonth width={24} height={24} />
              </button>

              {/* Exibe o texto da data em telas maiores */}
              <span className="hidden md:block">
                {format(currentStartDate, "dd/MM/yyyy")} -{" "}
                {format(
                  addDays(currentStartDate, daysToShow - 1),
                  "dd/MM/yyyy"
                )}
              </span>
            </div>

            {/* Botão de filtro com fundo azul */}
            <div className="relative">
              <button
                className="p-2 bg-blue-500 text-white rounded-lg"
                onClick={toggleFilterDropdown}
              >
                <FunnelIcon onClick={toggleFilterDropdown} />{" "}
                {/* Ícone do funil com onClick */}
              </button>
              {isFilterDropdownOpen && (
                <div className="absolute mt-2 right-0 bg-white border border-gray-300 shadow-lg rounded-md z-10">
                  <ul className="py-1">
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterChange("Todos")}
                    >
                      Todos
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterChange("Confirmado")}
                    >
                      Confirmado
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterChange("Andamento")}
                    >
                      Andamento
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterChange("Finalizado")}
                    >
                      Finalizado
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => handleFilterChange("Recusado")}
                    >
                      Recusado
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Botão de "Próximos dias" */}
          <button
            onClick={handleNextWeek}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            {/* Exibe ícone em telas pequenas */}
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
            {/* Exibe texto em telas maiores */}
            <span className="hidden md:block">Próximos dias &rarr;</span>
          </button>
        </div>

        {/* Modal do calendário */}
        <Modal
          isOpen={isCalendarModalOpen}
          onRequestClose={() => setIsCalendarModalOpen(false)}
          className="bg-white rounded-lg p-6 max-w-md mx-auto my-auto shadow-lg max-h-screen overflow-y-auto"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
        >
          <DatePicker
            selected={currentStartDate}
            onChange={(date: Date | null) => {
              if (date) {
                setCurrentStartDate(date);
              }
              setIsCalendarModalOpen(false); // Fecha o modal após selecionar uma data
            }}
            inline
          />
        </Modal>

        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {getDaysRange().map((day) => {
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
                          className={`p-2 mb-2 rounded cursor-pointer flex justify-center items-center ${getStatusColor(
                            agendamento.SituacaoAgendamento
                          )} text-white shadow`}
                          onClick={() => handleOpenModal(agendamento)}
                        >
                          <p className="text-sm text-center text-white">
                            {agendamento.TipoAgendamento} |{" "}
                            {agendamento.HoraAgendamento}
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

        {selectedAgendamento && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            className="bg-white rounded-lg p-6 max-w-lg mx-auto my-auto shadow-lg max-h-screen overflow-y-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Detalhes do Agendamento</h2>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleCloseModal}
              >
                Fechar
              </button>
            </div>

            {/* Exibir o Status do Agendamento */}
            <div className="mb-4">
              <span
                className={`px-4 py-2 rounded text-white font-semibold ${getStatusColor(
                  selectedAgendamento?.SituacaoAgendamento || ""
                )}`}
              >
                {selectedAgendamento?.SituacaoAgendamento}
              </span>
            </div>

            {/* Exibir Observação da Portaria */}

            {/* Exibir outros detalhes do agendamento */}
            <DadosPessoais usuarioId={selectedAgendamento.CodigoUsuario} />
            <DadosVeicular codigoVeiculo={selectedAgendamento.CodigoVeiculo} />
            <DadosAgendamentos
              dataAgendamento={selectedAgendamento.DataAgendamento ?? ""}
              horaAgendamento={selectedAgendamento.HoraAgendamento ?? ""}
              produto={selectedAgendamento?.DescricaoProduto ?? ""}
              quantidade={selectedAgendamento.QuantidadeAgendamento ?? 0}
              observacao={selectedAgendamento?.Observacao ?? null}
              arquivo={selectedAgendamento?.ArquivoAnexado ?? null}
              safra={selectedAgendamento?.AnoSafra ?? "N/A"} // Exibe o AnoSafra diretamente
            />

            {/* Utilizando o campo de observação da portaria */}
            <DadosPortaria
              codigoAgendamento={selectedAgendamento?.CodigoAgendamento ?? null}
              dataHoraSaida={
                selectedAgendamento?.DadosPortaria?.DataHoraSaida ?? "N/A"
              }
              observacaoPortaria={observacaoPortaria}
              setObservacaoPortaria={setObservacaoPortaria}
              isObservacaoEditable={
                selectedAgendamento.SituacaoAgendamento === "Confirmado"
              }
              situacaoAgendamento={selectedAgendamento.SituacaoAgendamento} // Passa o status do agendamento
            />

            <div className="flex justify-between mt-4 space-x-4">
              {selectedAgendamento.SituacaoAgendamento === "Confirmado" && (
                <>
                  {/* Removi o textarea separado para observação */}
                  <button
                    className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
                    onClick={() =>
                      handleAprovarAgendamento(selectedAgendamento)
                    }
                  >
                    Aprovar
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600"
                    onClick={handleOpenRecusaModal}
                  >
                    Recusar
                  </button>
                </>
              )}

              {selectedAgendamento.SituacaoAgendamento === "Andamento" && (
                <button
                  className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600"
                  onClick={() =>
                    handleFinalizarAgendamento(selectedAgendamento)
                  }
                >
                  Finalizar
                </button>
              )}
            </div>
          </Modal>
        )}

        <Modal
          isOpen={isRecusaModalOpen}
          onRequestClose={handleCloseRecusaModal}
          className="bg-white rounded-lg p-6 max-w-lg mx-auto my-auto shadow-lg z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <h2 className="text-lg font-bold mb-4">
            Por favor, insira o motivo da recusa:
          </h2>
          <textarea
            value={motivoRecusa}
            onChange={(e) => setMotivoRecusa(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-4"
            rows={4}
            placeholder="Digite o motivo da recusa"
          />
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={handleCloseRecusaModal}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleRecusarAgendamento(selectedAgendamento)}
            >
              Confirmar
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Portaria;
