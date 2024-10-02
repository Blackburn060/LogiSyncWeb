import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAgendamentosGestaoPatio } from "../services/gestaoPatioService";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/Navbar";

interface Agendamento {
  CodigoAgendamento: number;
  HoraAgendamento: string;
  Placa: string;
  SituacaoAgendamento: string;
  DataAgendamento: string;
}

const GestaoPatio: React.FC = () => {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date | null>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        if (currentDate && token) {
          const dataFormatada = currentDate.toISOString().split("T")[0];
          const response = await getAgendamentosGestaoPatio(token, dataFormatada);
          
          console.log('Response data:', response); // Verifique se os dados estão corretos
          
          if (Array.isArray(response)) {
            setAgendamentos(response);
          } else {
            setAgendamentos([]); // Se a resposta não for um array, definir como vazio
          }
        }
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        setAgendamentos([]); // Em caso de erro, também definir como vazio
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();
  }, [currentDate, token]);

  // Função para buscar agendamentos por status
  const getAgendamentosPorStatus = (status: string) => {
    return agendamentos.filter(
      (agendamento) =>
        agendamento.SituacaoAgendamento === status &&
        new Date(agendamento.DataAgendamento).toLocaleDateString() ===
          currentDate?.toLocaleDateString()
    );
  };

  // Função para renderizar os agendamentos
  const renderAgendamentos = (status: string, color: string) => {
    const agendamentosFiltrados = getAgendamentosPorStatus(status);
    return agendamentosFiltrados.length > 0 ? (
      agendamentosFiltrados.map((agendamento) => (
        <div
          key={agendamento.CodigoAgendamento}
          className={`p-2 m-2 rounded-md text-white ${color} flex justify-between`}
        >
          <span>{agendamento.HoraAgendamento}</span>
          <span>{agendamento.Placa || "Sem placa"}</span> {/* Fallback para a placa */}
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500">Nenhum agendamento encontrado.</p>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <h1 className="text-2xl font-bold text-center mb-6">Gestão de Pátio</h1>

      <div className="flex justify-center mb-4">
        <DatePicker
          selected={currentDate}
          onChange={(date: Date | null) => setCurrentDate(date)}
          dateFormat="dd/MM/yyyy"
          className="p-2 border border-gray-300 rounded-md"
        />
      </div>

      {loading ? (
        <p className="text-center text-lg">Carregando agendamentos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border p-4 rounded-lg bg-white shadow-md">
            <h2 className="text-lg font-semibold text-center mb-4">Aguardando Entrada</h2>
            {renderAgendamentos("Aguardando Entrada", "bg-yellow-500")}
          </div>
          <div className="border p-4 rounded-lg bg-white shadow-md">
            <h2 className="text-lg font-semibold text-center mb-4">Em Andamento</h2>
            {renderAgendamentos("Andamento", "bg-green-500")}
          </div>
          <div className="border p-4 rounded-lg bg-white shadow-md">
            <h2 className="text-lg font-semibold text-center mb-4">Concluído</h2>
            {renderAgendamentos("Finalizado", "bg-red-500")}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoPatio;
