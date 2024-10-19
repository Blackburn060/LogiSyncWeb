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
    transportadora: "Não Informada",
  });

  useEffect(() => {
    const fetchDadosPessoais = async () => {
      try {
        // Buscar dados pessoais do usuário vinculado ao agendamento
        const responseUsuario = await api.get(`/usuarios/${usuarioId}`);
        const userData = responseUsuario.data || {};


        // Atualiza dados pessoais
        setDadosPessoais((prevState) => ({
          ...prevState,
          nome: userData.NomeCompleto || "Não Informado",
          cpf: userData.CPF || "Não Informado",
          telefone: userData.NumeroCelular || "Não Informado",
        }));

        // Buscar transportadora vinculada ao usuário do agendamento
        if (userData.CodigoTransportadora) {
          const responseTransportadora = await api.get(
            `/transportadoras/${userData.CodigoTransportadora}`
          );
          const transportadoraData = responseTransportadora.data || {};

          // Atualiza transportadora
          setDadosPessoais((prevState) => ({
            ...prevState,
            transportadora: transportadoraData.Nome || "Não Informada",
          }));
        } else {
          // Caso o usuário não tenha uma transportadora vinculada
          setDadosPessoais((prevState) => ({
            ...prevState,
            transportadora: "Não Informada",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados pessoais e transportadora:", error);
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
          <label className="block font-semibold">Transportadora</label>
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
