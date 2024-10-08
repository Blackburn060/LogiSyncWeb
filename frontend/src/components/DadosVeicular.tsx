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
          const veiculoData = response.data || {}; // Verifique se há dados
          setVeiculo({
            placa: veiculoData.Placa || "N/A",
            marca: veiculoData.Marca || "N/A",
            modelo: veiculoData.ModeloTipo || "N/A",
            ano: veiculoData.AnoFabricacao || "N/A",
            cor: veiculoData.Cor || "N/A",
            capacidadeCarga: veiculoData.CapacidadeCarga || "N/A",
          });
        } catch (error) {
          console.error("Erro ao buscar dados veiculares:", error);
        }
      }
    };

    fetchDadosVeicular();
  }, [codigoVeiculo]);

  return (
    <div className="border p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold">DADOS VEICULARES</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Placa */}
        <div>
          <label className="block font-semibold">Placa</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={veiculo.placa}
            readOnly
          />
        </div>
        {/* Marca */}
        <div>
          <label className="block font-semibold">Marca</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={veiculo.marca}
            readOnly
          />
        </div>
        {/* Modelo */}
        <div>
          <label className="block font-semibold">Modelo/Tipo</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={veiculo.modelo}
            readOnly
          />
        </div>
        {/* Ano de Fabricação */}
        <div>
          <label className="block font-semibold">Ano de Fabricação</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={veiculo.ano}
            readOnly
          />
        </div>
        {/* Cor */}
        <div>
          <label className="block font-semibold">Cor</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={veiculo.cor}
            readOnly
          />
        </div>
        {/* Capacidade de Carga */}
        <div>
          <label className="block font-semibold">Capacidade de Carga</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={veiculo.capacidadeCarga}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default DadosVeicular;
