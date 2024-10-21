import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
import { AxiosError } from "axios";
import { isValid, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DadosPortariaProps {
  codigoAgendamento: number | null;
  dataHoraSaida: string;
  observacaoPortaria: string;
  setObservacaoPortaria: React.Dispatch<React.SetStateAction<string>>;
  isObservacaoEditable: boolean;
  situacaoAgendamento: string;
}

const DadosPortaria: React.FC<DadosPortariaProps> = ({ 
  codigoAgendamento, 
  dataHoraSaida, 
  observacaoPortaria, 
  setObservacaoPortaria,
  isObservacaoEditable,
  situacaoAgendamento
}) => {
  const [portariaData, setPortariaData] = useState({
    dataChegada: "N/A",
    motivoRecusa: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatarData = (dataString: string) => {
    if (!dataString || dataString === "N/A") return "N/A";
    
    const data = new Date(dataString);
    
    if (!isValid(data)) {
      return "Data inválida";
    }
    
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
              motivoRecusa: response.data.MotivoRecusa || "Nenhum motivo de recusa disponível",
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
                motivoRecusa: "Nenhum motivo de recusa disponível" 
              });
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
              value={observacaoPortaria}
              onChange={(e) => setObservacaoPortaria(e.target.value)}
              placeholder="Insira uma observação"
              disabled={!isObservacaoEditable}
            ></textarea>
          </div>
        </div>
      )}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default DadosPortaria;
