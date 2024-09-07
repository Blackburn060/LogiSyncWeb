import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface DadosPessoaisProps {
  usuarioId: number;  // O ID do usuário será passado via props
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
        console.log("Response data:", response.data); // Para depuração
        setDadosPessoais({
          nome: response.data.NomeCompleto || "N/A",  // Corrigido para NomeCompleto
          cpf: response.data.CPF || "N/A",
          telefone: response.data.NumeroCelular || "N/A",  // Corrigido para NumeroCelular
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
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">DADOS PESSOAIS</h2>
      <div className="mt-4">
        <p><strong>Nome:</strong> {dadosPessoais.nome}</p>
        <p><strong>CPF:</strong> {dadosPessoais.cpf}</p>
        <p><strong>Telefone:</strong> {dadosPessoais.telefone}</p>
      </div>
    </div>
  );
};

export default DadosPessoais;
