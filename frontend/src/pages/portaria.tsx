import React, { useState, useEffect } from "react";
import {
  getAgendamentosPorStatus,
  finalizarAgendamento,
  aprovarAgendamento,
  recusarAgendamento,
} from "../services/portariaService";
import toast, { Toaster } from 'react-hot-toast';
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
import "react-datepicker/dist/react-datepicker.css";

// Função para controlar a rolagem da página quando o modal estiver aberto
const toggleBodyScroll = (isModalOpen: boolean) => {
  if (isModalOpen) {
    document.body.style.overflow = "hidden"; // Impede a rolagem
  } else {
    document.body.style.overflow = ""; // Restaura a rolagem
  }
};

// Função que retorna a cor de fundo de acordo com o status do agendamento
const getStatusColor = (status: string) => {
  switch (status) {
    case "Confirmado":
      return "bg-green-500";
    case "Recusado":
      return "bg-red-500";
    case "Andamento":
      return "bg-yellow-500";
    case "Finalizado":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const Portaria: React.FC = () => {
  const { token, user } = useAuth(); // Obtendo o token e o usuario do contexto de autenticação
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecusaModalOpen, setIsRecusaModalOpen] = useState(false); // Estado para o modal de recusa
  const [motivoRecusa, setMotivoRecusa] = useState(""); // Motivo de recusa
  const [loading, setLoading] = useState<boolean>(true);

  const daysToShow = 7;

  useEffect(() => {
    toggleBodyScroll(isModalOpen || isRecusaModalOpen);
    return () => toggleBodyScroll(false);
  }, [isModalOpen, isRecusaModalOpen]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        const data = await getAgendamentosPorStatus(token!); // Busca os agendamentos por status
        setAgendamentos(data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [token, currentStartDate]);

  // Função para finalizar o agendamento
  const handleFinalizarAgendamento = async (agendamentoId: number) => {
    try {
      await finalizarAgendamento(token!, agendamentoId); // Finaliza o agendamento
      toast.success("Agendamento finalizado com sucesso!");
      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.filter(
          (agendamento) => agendamento.CodigoAgendamento !== agendamentoId
        )
      );
      setIsModalOpen(false); // Fecha o modal após finalizar
    } catch (error) {
      console.error("Erro ao finalizar o agendamento:", error);
      toast.error("Erro ao finalizar o agendamento.");
    }
  };

  // Função para aprovar agendamento
  const handleAprovarAgendamento = async (agendamento: Agendamento) => {
    try {
      const usuarioId = Number(user!.id); // Obtendo o usuarioId do contexto de autenticação
    
      await aprovarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        agendamento.TipoAgendamento!,
        usuarioId // Agora passando o usuarioId correto
      );
    
      toast.success("Agendamento aprovado com sucesso!"); // Mensagem de sucesso
      setIsModalOpen(false);
    
      // Atualize a lista de agendamentos removendo o que foi aprovado ou atualizando seu status
      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Andamento" }
            : a
        )
      );
    } catch (error) {
      toast.error("Erro ao aprovar o agendamento."); // Mensagem de erro
      console.error("Erro ao aprovar o agendamento:", error);
    }
  };

  // Função para abrir o modal de recusa
  const handleOpenRecusaModal = () => {
    setIsRecusaModalOpen(true);
  };

  // Função para fechar o modal de recusa
  const handleCloseRecusaModal = () => {
    setIsRecusaModalOpen(false);
    setMotivoRecusa(""); // Limpa o motivo quando fechar o modal
  };

  // Função para recusar agendamento
  const handleRecusarAgendamento = async (agendamento: Agendamento) => {
    try {
      const usuarioId = Number(user!.id); // Converta para number
  
      if (!motivoRecusa) {
        toast.error("Motivo de recusa é necessário."); // Mensagem de erro
        return;
      }
  
      // Passe o tipo do agendamento junto com a requisição de recusa
      await recusarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        motivoRecusa,
        usuarioId
      );
  
      toast.success("Agendamento recusado com sucesso!"); // Mensagem de sucesso
      setIsModalOpen(false);
      setIsRecusaModalOpen(false); // Fecha o modal de recusa
  
      // Atualize a lista de agendamentos removendo o que foi recusado ou atualizando seu status
      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Recusado" }
            : a
        )
      );
    } catch (error) {
      toast.error("Erro ao recusar o agendamento."); // Mensagem de erro
      console.error("Erro ao recusar o agendamento:", error);
    }
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
      (agendamento) => agendamento.DataAgendamento === dayString
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

  const handleOpenModal = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAgendamento(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster /> {/* Toaster para as notificações */}
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">Portaria</h1>
        </div>

        {/* Navegação entre semanas */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            &larr; Dias anteriores
          </button>

          <span className="text-lg font-semibold">
            {format(currentStartDate, "dd/MM/yyyy")} -{" "}
            {format(addDays(currentStartDate, daysToShow - 1), "dd/MM/yyyy")}
          </span>

          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            Próximos dias &rarr;
          </button>
        </div>

        {/* Listagem dos agendamentos por dia */}
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

        {/* Modal para detalhes e ações */}
        {selectedAgendamento && (
          <Modal
            isOpen={isModalOpen}
            onRequestClose={handleCloseModal}
            className="bg-white rounded-lg p-6 max-w-lg mx-auto my-auto shadow-lg max-h-screen overflow-y-auto"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
          >
            <h2 className="text-2xl font-bold mb-4">Detalhes do Agendamento</h2>
            <DadosPessoais usuarioId={selectedAgendamento.CodigoUsuario} />
            <DadosVeicular codigoVeiculo={selectedAgendamento.CodigoVeiculo} />
            <DadosAgendamentos
              dataAgendamento={selectedAgendamento.DataAgendamento ?? ""}
              horaAgendamento={selectedAgendamento.HoraAgendamento ?? ""}
              produto={selectedAgendamento.DescricaoProduto ?? ""}
              quantidade={selectedAgendamento.QuantidadeAgendamento ?? 0}
              observacao={selectedAgendamento.Observacao ?? null}
            />
            <DadosPortaria
              codigoAgendamento={selectedAgendamento.CodigoAgendamento!}
            />

            <div className="flex justify-end mt-4 space-x-4">
              {/* Se o status for "Confirmado", mostra os botões de Aprovar e Recusar */}
              {selectedAgendamento.SituacaoAgendamento === "Confirmado" && (
                <>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() =>
                      handleAprovarAgendamento(selectedAgendamento)
                    }
                  >
                    Aprovar
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={handleOpenRecusaModal} // Abre o modal de recusa
                  >
                    Recusar
                  </button>
                </>
              )}

              {/* Se o status for "Andamento", mostra apenas o botão de Finalizar */}
              {selectedAgendamento.SituacaoAgendamento === "Andamento" && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() =>
                    handleFinalizarAgendamento(
                      selectedAgendamento.CodigoAgendamento!
                    )
                  }
                >
                  Finalizar
                </button>
              )}

              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleCloseModal}
              >
                Fechar
              </button>
            </div>
          </Modal>
        )}

        {/* Modal de Recusa */}
        <Modal
          isOpen={isRecusaModalOpen}
          onRequestClose={handleCloseRecusaModal}
          className="bg-white rounded-lg p-6 max-w-lg mx-auto my-auto shadow-lg z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <h2 className="text-lg font-bold mb-4">Por favor, insira o motivo da recusa:</h2>
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
              onClick={() => handleRecusarAgendamento(selectedAgendamento!)}
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
