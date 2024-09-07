import React from "react";

interface DadosAgendamentoProps {
  dataAgendamento: string;
  horaAgendamento: string;
  produto: string;  // Agora espera apenas string (nome do produto)
  quantidade: number | null;
  observacao: string | null;
}

const DadosAgendamento: React.FC<DadosAgendamentoProps> = ({
  dataAgendamento,
  horaAgendamento,
  produto,
  quantidade,
  observacao,
}) => {
  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">DADOS DO AGENDAMENTO</h2>
      <div className="mt-4">
        <p><strong>Data:</strong> {dataAgendamento}</p>
        <p><strong>Horário:</strong> {horaAgendamento}</p>
        <p><strong>Produto:</strong> {produto}</p> {/* Agora sempre mostra o nome do produto */}
        <p><strong>Quantidade:</strong> {quantidade}</p>
        <p><strong>Observação:</strong> {observacao}</p>
      </div>
    </div>
  );
};

export default DadosAgendamento;
