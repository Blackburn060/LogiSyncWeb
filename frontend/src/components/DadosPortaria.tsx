import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface DadosPortariaProps {
  codigoPortaria: number | null;
}

const DadosPortaria: React.FC<DadosPortariaProps> = ({ codigoPortaria }) => {
  const [portaria, setPortaria] = useState({
    dataChegada: "N/A",
    dataSaida: "N/A",
    observacao: "N/A",
  });

  useEffect(() => {
    const fetchDadosPortaria = async () => {
      if (codigoPortaria) {
        try {
          const response = await api.get(`/portarias/${codigoPortaria}`);
          setPortaria({
            dataChegada: response.data.DataHoraEntrada || "N/A",
            dataSaida: response.data.DataHoraSaida || "N/A",
            observacao: response.data.ObservacaoPortaria || "N/A",
          });
        } catch (error) {
          console.error("Erro ao buscar dados da portaria:", error);
        }
      }
    };

    fetchDadosPortaria();
  }, [codigoPortaria]);

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">DADOS DA PORTARIA</h2>
      <div className="mt-4">
        <p><strong>Data de Chegada:</strong> {portaria.dataChegada}</p>
        <p><strong>Data de Saída:</strong> {portaria.dataSaida}</p>
        <p><strong>Observação:</strong> {portaria.observacao}</p>
      </div>
    </div>
  );
};

export default DadosPortaria;
