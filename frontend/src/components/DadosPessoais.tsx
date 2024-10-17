import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface DadosPessoaisProps {
  usuarioId: number;
}

const DadosPessoais: React.FC<DadosPessoaisProps> = ({ usuarioId }) => {
  const [dadosPessoais, setDadosPessoais] = useState({
    nome: "Não Informado",
    cpf: "Não Informado",
    telefone: "Não Informado",
    transportadora: "Não Informada", // Novo campo para o nome da transportadora
  });

  useEffect(() => {
    const fetchDadosPessoais = async () => {
      try {
        // Buscar dados pessoais do usuário
        const responseUsuario = await api.get(`/usuarios/${usuarioId}`);
        const userData = responseUsuario.data || {};

        // Buscar nome da transportadora usando o CodigoTransportadora do usuário
        let nomeTransportadora = "Não Informada";
        if (userData.CodigoTransportadora) {
          try {
            const responseTransportadora = await api.get(
              `/transportadoras/${userData.CodigoTransportadora}`
            );
            nomeTransportadora =
              responseTransportadora.data.Nome || "Não Informada";
          } catch (error) {
            console.error(
              "Erro ao buscar nome da transportadora:",
              error
            );
          }
        }

        // Atualizar estado com dados pessoais e nome da transportadora
        setDadosPessoais({
          nome: userData.NomeCompleto || "Não Informado",
          cpf: userData.CPF || "Não Informado",
          telefone: userData.NumeroCelular || "Não Informado",
          transportadora: nomeTransportadora,
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
        <div>
          <label className="block font-semibold">Telefone</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={dadosPessoais.telefone}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Transportadora</label> {/* Novo campo */}
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={dadosPessoais.transportadora} // Exibindo a transportadora
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default DadosPessoais;
