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
export function IcBaselineCompareArrows(props: React.SVGProps<SVGSVGElement>) {
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
  const [observacaoAdmin] = useState(""); // Para a observação do administrador ao aprovar
  const [observacao, setObservacao] = useState(""); // Para mostrar a observação correta no modal
  const [loading, setLoading] = useState<boolean>(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false); // Controla a exibição do modal do calendário

  const daysToShow = 7;

  useEffect(() => {
    toggleBodyScroll(isModalOpen || isRecusaModalOpen);
    return () => toggleBodyScroll(false);
  }, [isModalOpen, isRecusaModalOpen]);

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

  const handleFinalizarAgendamento = async (agendamento: Agendamento) => {
    try {
      const dataHoraSaida = new Date().toISOString();
      console.log("Atualizando agendamento com DataHoraSaida:", dataHoraSaida);

      const response = await finalizarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        agendamento.TipoAgendamento!,
        dataHoraSaida
      );

      console.log("Resposta da API:", response);

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

      // Se o admin quiser adicionar uma observação antes de aprovar
      await aprovarAgendamento(
        token!,
        agendamento.CodigoAgendamento!,
        agendamento.TipoAgendamento!,
        usuarioId
      );

      toast.success("Agendamento aprovado com sucesso!");
      handleCloseModal();

      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Andamento", Observacao: observacaoAdmin } // Adicionar observação do admin
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

      setAgendamentos((prevAgendamentos) =>
        prevAgendamentos.map((a) =>
          a.CodigoAgendamento === agendamento.CodigoAgendamento
            ? { ...a, SituacaoAgendamento: "Recusado", MotivoRecusa: motivoRecusa } // Adicionar motivo de recusa
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
    setObservacao(""); // Resetar observação

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

      // Ajustar observação com base no status
      if (agendamento.SituacaoAgendamento === "Recusado") {
        setObservacao(agendamento.MotivoRecusa || "Sem motivo fornecido");
      } else if (agendamento.SituacaoAgendamento === "Andamento" || agendamento.SituacaoAgendamento === "Finalizado") {
        setObservacao(agendamento.Observacao || "Aprovado pela portaria");
      }

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <Toaster />

      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-700">Portaria</h1>
          <button
            onClick={voltarParaHoje}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            <IcBaselineCompareArrows width={20} height={20} /> {/* Novo ícone sendo utilizado */}
          </button>
        </div>

        {/* Navegação entre semanas */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            &larr; Dias anteriores
          </button>

          {/* Botão que abre o modal do calendário */}
          <div>
            <span
              className="text-lg font-semibold cursor-pointer"
              onClick={() => setIsCalendarModalOpen(true)} // Abre o modal do calendário
            >
              {format(currentStartDate, "dd/MM/yyyy")} -{" "}
              {format(addDays(currentStartDate, daysToShow - 1), "dd/MM/yyyy")}
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            Próximos dias &rarr;
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
       
         <DadosPessoais usuarioId={selectedAgendamento.CodigoUsuario} />
         <DadosVeicular codigoVeiculo={selectedAgendamento.CodigoVeiculo} />
         <DadosAgendamentos
           dataAgendamento={selectedAgendamento.DataAgendamento ?? ""}
           horaAgendamento={selectedAgendamento.HoraAgendamento ?? ""}
           produto={selectedAgendamento?.DescricaoProduto ?? ""}
           quantidade={selectedAgendamento.QuantidadeAgendamento ?? 0}
           observacao={observacao} // Mostrar observação correta
           arquivo={selectedAgendamento?.ArquivoAnexado ?? null}
         />
       
         <DadosPortaria
           codigoAgendamento={selectedAgendamento?.CodigoAgendamento ?? null}
           dataHoraSaida={
             selectedAgendamento?.DadosPortaria?.DataHoraSaida ?? "N/A"
           }
         />
       
         <div className="flex justify-between mt-4 space-x-4">
           {selectedAgendamento.SituacaoAgendamento === "Confirmado" && (
             <>
               <button
                 className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
                 onClick={() => handleAprovarAgendamento(selectedAgendamento)}
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
               onClick={() => handleFinalizarAgendamento(selectedAgendamento)}
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
