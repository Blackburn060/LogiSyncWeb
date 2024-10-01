import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";  // Altere o caminho conforme necessário

interface Transportadora {
  NomeFantasia: string;
  CNPJ: string;
}

interface DadosTransportadoraProps {
  codigoTransportadora: number;  // Este será o parâmetro passado
}

const DadosTransportadora: React.FC<DadosTransportadoraProps> = ({ codigoTransportadora }) => {
  const [transportadora, setTransportadora] = useState<Transportadora | null>(null);

  useEffect(() => {
    const fetchTransportadora = async () => {
      try {
        const response = await api.get(`/transportadoras/${codigoTransportadora}`);
        setTransportadora(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados da transportadora:", error);
      }
    };

    if (codigoTransportadora) {
      fetchTransportadora();
    }
  }, [codigoTransportadora]);

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">DADOS TRANSPORTADORA</h2>
      <div>
        <label className="block font-bold">Nome Fantasia</label>
        <input
          type="text"
          value={transportadora?.NomeFantasia || "N/A"}
          className="border p-2 rounded w-full"
          disabled
        />
      </div>
      <div>
        <label className="block font-bold">CNPJ</label>
        <input
          type="text"
          value={transportadora?.CNPJ || "N/A"}
          className="border p-2 rounded w-full"
          disabled
        />
      </div>
    </div>
  );
};

export default DadosTransportadora;
