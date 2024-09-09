import React, { useState, useEffect } from "react";
import { getAgendamentos } from "../services/agendamentoService";
import { Agendamento } from "../models/Agendamento";
import Navbar from "../components/Navbar";
import { addDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale"; // Importando localização pt-BR
import DatePicker from "react-datepicker";
import Modal from "react-modal"; // Importando o Modal

import "react-datepicker/dist/react-datepicker.css"; // Estilos do DatePicker

// Estilo do modal (você pode customizar como preferir)
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1000, // Mantém o modal no topo
  },
  overlay: {
    zIndex: 1000, // Mantém o overlay no topo
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo escurecido
  },
};

const AgendamentosAdmin: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStartDate, setCurrentStartDate] = useState(new Date()); // Data inicial exibida na tela
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Controla a abertura do modal de calendário
  const daysToShow = 7; // Número de dias a serem exibidos

  // Busca os agendamentos toda vez que a data inicial mudar
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
  }, [currentStartDate]); // Atualiza os agendamentos quando a data inicial mudar

  // Função para formatar a data do agendamento em português
  const formatarData = (data: string | Date) => {
    const dataObj = new Date(data);
    return format(dataObj, "eeee, dd/MM/yyyy", { locale: ptBR });
  };

  // Função para obter um intervalo de dias (número de dias definido por 'daysToShow')
  const getDaysRange = () => {
    const days = [];
    for (let i = 0; i < daysToShow; i++) {
      const day = addDays(currentStartDate, i);
      days.push(day);
    }
    return days;
  };

  // Função para buscar agendamentos de um determinado dia
  const getAgendamentosForDay = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    return agendamentos.filter(
      (agendamento) => agendamento.DataAgendamento === dayString
    );
  };

  // Função para avançar dias
  const handleNextWeek = () => {
    setCurrentStartDate(addDays(currentStartDate, daysToShow));
  };

  // Função para retroceder dias
  const handlePreviousWeek = () => {
    setCurrentStartDate(subDays(currentStartDate, daysToShow));
  };

  // Função para lidar com a mudança de data no calendário
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setCurrentStartDate(date); // Atualiza a data inicial
    }
    setIsCalendarOpen(false); // Fecha o modal do calendário
  };

  // Função para definir a classe com base no status do agendamento
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Autorizar Agendamentos</h1>

        {/* Botões para avançar/retroceder dias e abrir o calendário */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 bg-blue-500 text-white rounded-lg"
          >
            &larr; Dias anteriores
          </button>

          {/* Data selecionada com botão para abrir o calendário */}
          <span
            className="text-lg font-semibold cursor-pointer"
            onClick={() => setIsCalendarOpen(true)} // Abre o modal ao clicar
          >
            {format(currentStartDate, "dd/MM/yyyy")} -{" "}
            {format(addDays(currentStartDate, daysToShow - 1), "dd/MM/yyyy")}
          </span>

          <button
            onClick={handleNextWeek}
            className="p-2 bg-blue-500 text-white rounded-lg"
          >
            Próximos dias &rarr;
          </button>
        </div>

        {/* Modal para exibir o calendário */}
        <Modal
          isOpen={isCalendarOpen}
          onRequestClose={() => setIsCalendarOpen(false)} // Fecha o modal ao clicar fora ou apertar "ESC"
          style={customStyles}
          contentLabel="Selecionar Data"
        >
          <DatePicker
            selected={currentStartDate}
            onChange={handleDateChange} // Atualiza a data inicial ao escolher uma nova data
            locale={ptBR}
            inline
          />
        </Modal>

        {loading ? (
          <p>Carregando agendamentos...</p>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {getDaysRange().map((day) => {
              const agendamentosForDay = getAgendamentosForDay(day); // Certifique-se de obter o array aqui
              return (
                <div key={day.toString()} className="border p-4 rounded-lg">
                  {/* Aplica a classe de tamanho de texto menor aqui */}
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
                          className={`p-2 mb-2 rounded ${getStatusClass(
                            agendamento.SituacaoAgendamento
                          )}`}
                        >
                          <p className="text-sm">
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
