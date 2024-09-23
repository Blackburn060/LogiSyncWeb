import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";
import { AxiosError } from "axios";  // Importa AxiosError para definir o tipo do erro

interface DadosPortariaProps {
  codigoAgendamento: number | null;
  dataHoraSaida: string;  // Adiciona a nova propriedade
}

const DadosPortaria: React.FC<DadosPortariaProps> = ({ codigoAgendamento, dataHoraSaida }) => {
  const [portariaData, setPortariaData] = useState({
    dataChegada: "N/A",
    observacao: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Para evitar atualizações no componente desmontado
    const fetchDadosPortaria = async () => {
      if (codigoAgendamento) {
        try {
          const response = await api.get(`/portarias/${codigoAgendamento}`);
          console.log('Dados da portaria recebidos:', response.data); // Adicione este log

          if (isMounted) {
            setPortariaData({
              dataChegada: response.data.DataHoraEntrada || "N/A",
              observacao: response.data.ObservacaoPortaria || response.data.MotivoRecusa || "N/A", // Usando a observação ou motivo de recusa
            });
            setErrorMessage(null); // Limpa a mensagem de erro se os dados foram encontrados
          }
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 404) {
              console.log("Dados da portaria não encontrados.");
              setErrorMessage("Dados da portaria não encontrados.");
            } else {
              console.error("Erro ao buscar dados da portaria:", error.message);
              setErrorMessage("Erro ao carregar dados da portaria.");
            }
          } else {
            console.error("Erro desconhecido ao buscar dados da portaria:", error);
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
      isMounted = false; // Cleanup no desmontar do componente
    };
  }, [codigoAgendamento]);

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
              value={dataHoraSaida} // Usando a prop diretamente
              readOnly
              placeholder="Data de Saída"
            />
          </div>
          <div className="col-span-2">
            <label className="block font-semibold">Observação</label>
            <textarea
              className="border w-full px-2 py-1 rounded-md"
              value={portariaData.observacao}
              readOnly
              placeholder="Observações"
            ></textarea>
          </div>
        </div>
      )}
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default DadosPortaria;
