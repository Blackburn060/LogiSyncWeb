import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface DadosPortariaProps {
  codigoAgendamento: number | null;
}

const DadosPortaria: React.FC<DadosPortariaProps> = ({ codigoAgendamento }) => {
  const [portariaData, setPortariaData] = useState({
    dataChegada: "N/A",
    dataSaida: "N/A",
    observacao: "N/A",
  });

  useEffect(() => {
    const fetchDadosPortaria = async () => {
      if (codigoAgendamento) {
        try {
          const response = await api.get(`/portarias/${codigoAgendamento}`);
          setPortariaData({
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
  }, [codigoAgendamento]);

  return (
    <div className="border p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold">DADOS DA PORTARIA</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Data/hora da Chegada</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={portariaData.dataChegada}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Data/hora da Saída</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={portariaData.dataSaida}
            readOnly
          />
        </div>
        <div className="col-span-2">
          <label className="block font-semibold">Observação</label>
          <textarea
            className="border w-full px-2 py-1 rounded-md"
            value={portariaData.observacao}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default DadosPortaria;
