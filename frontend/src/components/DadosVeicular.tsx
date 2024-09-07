import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface DadosVeicularProps {
  codigoVeiculo: number | null;
}

const DadosVeicular: React.FC<DadosVeicularProps> = ({ codigoVeiculo }) => {
  const [veiculo, setVeiculo] = useState({
    placa: "N/A",
    marca: "N/A",
    modelo: "N/A",
    ano: "N/A",
    cor: "N/A",
    capacidadeCarga: "N/A",
  });

  useEffect(() => {
    const fetchDadosVeicular = async () => {
      if (codigoVeiculo) {
        try {
          const response = await api.get(`/veiculos/${codigoVeiculo}`);
          setVeiculo({
            placa: response.data.Placa || "N/A",
            marca: response.data.Marca || "N/A",
            modelo: response.data.ModeloTipo || "N/A",
            ano: response.data.AnoFabricacao || "N/A",
            cor: response.data.Cor || "N/A",
            capacidadeCarga: response.data.CapacidadeCarga || "N/A",
          });
        } catch (error) {
          console.error("Erro ao buscar dados veiculares:", error);
        }
      }
    };

    fetchDadosVeicular();
  }, [codigoVeiculo]);

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">DADOS VEICULARES</h2>
      <div className="mt-4">
        <p><strong>Placa:</strong> {veiculo.placa}</p>
        <p><strong>Marca:</strong> {veiculo.marca}</p>
        <p><strong>Modelo:</strong> {veiculo.modelo}</p>
        <p><strong>Ano:</strong> {veiculo.ano}</p>
        <p><strong>Cor:</strong> {veiculo.cor}</p>
        <p><strong>Capacidade de Carga:</strong> {veiculo.capacidadeCarga}</p>
      </div>
    </div>
  );
};

export default DadosVeicular;
