import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
import { AxiosError } from "axios";  // Importa AxiosError para definir o tipo do erro
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";  // Importa o locale para PT-BR

interface DadosPortariaProps {
  codigoAgendamento: number | null;
  dataHoraSaida: string;
  observacaoPortaria: string;
  setObservacaoPortaria: React.Dispatch<React.SetStateAction<string>>;
  isObservacaoEditable: boolean; // Prop para controlar se a observação é editável
  situacaoAgendamento: string; // Status do agendamento
}

const DadosPortaria: React.FC<DadosPortariaProps> = ({ 
  codigoAgendamento, 
  dataHoraSaida, 
  observacaoPortaria, 
  setObservacaoPortaria,
  isObservacaoEditable,
  situacaoAgendamento // Status do agendamento
}) => {
  const [portariaData, setPortariaData] = useState({
    dataChegada: "N/A",
    observacao: "",
    motivoRecusa: "", // Adiciona o motivo da recusa aqui
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatarData = (dataString: string) => {
    if (!dataString || dataString === "N/A") return "N/A";
    const data = new Date(dataString);
    return format(data, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDadosPortaria = async () => {
      if (codigoAgendamento) {
        try {
          const response = await api.get(`/portarias/${codigoAgendamento}`);
          if (isMounted) {
            setPortariaData({
              dataChegada: formatarData(response.data.DataHoraEntrada) || "N/A",
              observacao: response.data.ObservacaoPortaria || "Nenhuma observação disponível",
              motivoRecusa: response.data.MotivoRecusa || "Nenhum motivo de recusa disponível", // Adiciona o motivo da recusa
            });

            // Se o status for "Reprovado", exibe o MotivoRecusa em vez de ObservacaoPortaria
            if (situacaoAgendamento === "Reprovado") {
              setObservacaoPortaria(response.data.MotivoRecusa || "Nenhum motivo de recusa disponível");
            } else {
              setObservacaoPortaria(response.data.ObservacaoPortaria || "Nenhuma observação disponível");
            }

            setErrorMessage(null); 
          }
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
              setPortariaData({ 
                dataChegada: "N/A", 
                observacao: "Nenhuma observação disponível", 
                motivoRecusa: "Nenhum motivo de recusa disponível" 
              });
              setObservacaoPortaria("Nenhuma observação disponível");
              setErrorMessage(null); 
            } else {
              setErrorMessage("Erro ao carregar dados da portaria.");
            }
          } else {
            setErrorMessage("Erro desconhecido ao buscar dados da portaria.");
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDadosPortaria();

    return () => {
      isMounted = false;
    };
  }, [codigoAgendamento, situacaoAgendamento, setObservacaoPortaria]);

  return (
    <div className="border p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold">DADOS DA PORTARIA</h2>
      {loading ? (
        <p>Carregando dados da portaria...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Data/hora da Chegada</label>
            <input
              type="text"
              className="border w-full px-2 py-1 rounded-md"
              value={portariaData.dataChegada}
              readOnly
              placeholder="Data de Chegada"
            />
          </div>
          <div>
            <label className="block font-semibold">Data/hora da Saída</label>
            <input
              type="text"
              className="border w-full px-2 py-1 rounded-md"
              value={formatarData(dataHoraSaida) || "N/A"}
              readOnly
              placeholder="Data de Saída"
            />
          </div>
          <div className="col-span-2">
            <label className="block font-semibold">Observação</label>
            <textarea
              className="border w-full px-2 py-1 rounded-md"
              value={observacaoPortaria} // Usando observacaoPortaria ou motivoRecusa
              onChange={(e) => setObservacaoPortaria(e.target.value)} // Permitir que a observação seja atualizada
              placeholder="Insira uma observação"
              disabled={!isObservacaoEditable} // Desabilita o campo se não for editável
            ></textarea>
          </div>
        </div>
      )}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default DadosPortaria;
