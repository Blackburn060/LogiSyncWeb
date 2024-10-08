import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  getAgendamentosGestaoPatio,
  getVeiculoPorCodigo,
  escutarAtualizacoesAgendamentos, // Importa a função de SSE
} from "../services/gestaoPatioService";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/Navbar";

interface Agendamento {
  CodigoAgendamento: number;
  CodigoVeiculo: number;
  HoraAgendamento: string;
  Placa?: string;
  SituacaoAgendamento: string;
  DataAgendamento: string;
  TipoAgendamento: string;
}

const GestaoPatio: React.FC = () => {
  const { token } = useAuth(); // Aqui garantimos que o token está disponível
  const [currentDate, setCurrentDate] = useState<Date | null>(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        setLoading(true);
        if (currentDate && token) {
          const dataFormatada = currentDate.toLocaleDateString('en-CA'); // Corrigido para evitar problemas de fuso horário
          const response = await getAgendamentosGestaoPatio(token, dataFormatada);

          if (Array.isArray(response)) {
            const agendamentosComPlacas = await Promise.all(
              response.map(async (agendamento: Agendamento) => {
                if (agendamento.CodigoVeiculo) {
                  const veiculo = await getVeiculoPorCodigo(token, agendamento.CodigoVeiculo);
                  console.log(`Veículo do agendamento ${agendamento.CodigoAgendamento}:`, veiculo);
                  agendamento.Placa = veiculo?.Placa || "Sem placa";
                } else {
                  agendamento.Placa = "Sem placa";
                }
                return agendamento;
              })
            );
            setAgendamentos(agendamentosComPlacas);
          } else {
            setAgendamentos([]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        setAgendamentos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentos();

    // Configurar o SSE para escutar atualizações automáticas
    if (token) {
      const eventSource = escutarAtualizacoesAgendamentos(token, (atualizacao: Agendamento) => {
        console.log("Recebendo atualização de agendamento via SSE:", atualizacao);
        setAgendamentos((prevAgendamentos) => {
          const agendamentoExistente = prevAgendamentos.find(
            (agendamento) => agendamento.CodigoAgendamento === atualizacao.CodigoAgendamento
          );

          if (agendamentoExistente) {
            return prevAgendamentos.map((agendamento) =>
              agendamento.CodigoAgendamento === atualizacao.CodigoAgendamento
                ? { ...agendamento, ...atualizacao }
                : agendamento
            );
          } else {
            return [...prevAgendamentos, atualizacao];
          }
        });
      });

      return () => {
        eventSource.close();
      };
    }
  }, [currentDate, token]);

  const getAgendamentosPorStatus = (status: string) => {
    return agendamentos.filter(
      (agendamento) =>
        agendamento.SituacaoAgendamento === status &&
        agendamento.DataAgendamento === currentDate?.toLocaleDateString('en-CA') // Corrigido aqui também
    );
  };

  const renderAgendamentos = (status: string, color: string) => {
    const agendamentosFiltrados = getAgendamentosPorStatus(status);

    return agendamentosFiltrados.length > 0 ? (
      agendamentosFiltrados.map((agendamento) => (
        <div
          key={agendamento.CodigoAgendamento}
          className={`p-2 m-2 rounded-md text-white ${color} flex justify-between items-center space-x-4`}
        >
          <span><strong>Horário:</strong> {agendamento.HoraAgendamento}</span>
          <span><strong>Tipo:</strong> {agendamento.TipoAgendamento || "Sem tipo"}</span>
          <span><strong>Placa:</strong> {agendamento.Placa || "Sem placa"}</span>
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
            {renderAgendamentos("Confirmado", "bg-yellow-500")}
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
