import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface DadosPessoaisProps {
  usuarioId: number;
}

const DadosPessoais: React.FC<DadosPessoaisProps> = ({ usuarioId }) => {
  const [dadosPessoais, setDadosPessoais] = useState({
    nome: "N/A",
    cpf: "N/A",
    telefone: "N/A",
  });

  useEffect(() => {
    const fetchDadosPessoais = async () => {
      try {
        const response = await api.get(`/usuarios/${usuarioId}`);
        const userData = response.data || {}; // Verifique se há dados
        setDadosPessoais({
          nome: userData.NomeCompleto || "N/A",
          cpf: userData.CPF || "N/A",
          telefone: userData.NumeroCelular || "N/A",
        });
      } catch (error) {
        console.error("Erro ao buscar dados pessoais:", error);
      }
    };

    if (usuarioId) {
      fetchDadosPessoais();
    }
  }, [usuarioId]);

  return (
    <div className="border p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">DADOS PESSOAIS</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Nome</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={dadosPessoais.nome}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">CPF</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={dadosPessoais.cpf}
            readOnly
          />
        </div>
        <div className="col-span-2">
          <label className="block font-semibold">Telefone</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={dadosPessoais.telefone}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default DadosPessoais;
