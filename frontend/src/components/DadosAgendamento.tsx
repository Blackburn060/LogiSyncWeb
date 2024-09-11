import React from "react";

interface DadosAgendamentoProps {
  dataAgendamento: string;
  horaAgendamento: string;
  produto: string;
  quantidade: number | null;
  observacao: string | null;
  safra: string | null;
  arquivo: string | null; // Link ou nome do arquivo
}

const DadosAgendamento: React.FC<DadosAgendamentoProps> = ({
  dataAgendamento,
  horaAgendamento,
  produto,
  quantidade,
  observacao,
  safra,
  arquivo,
}) => {
  return (
    <div className="border p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold">DADOS DO AGENDAMENTO</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Data</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={dataAgendamento}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Horário</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={horaAgendamento}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Produto</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={produto}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Quantidade</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={quantidade !== null ? String(quantidade) : "N/A"}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Safra</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={safra || "N/A"}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold">Arquivo</label>
          {arquivo ? (
            <a
              href={arquivo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download do arquivo
            </a>
          ) : (
            <p>Nenhum arquivo anexado</p>
          )}
        </div>
        <div className="col-span-2">
          <label className="block font-semibold">Observação</label>
          <textarea
            className="border w-full px-2 py-1 rounded-md"
            value={observacao || "N/A"}
            readOnly
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default DadosAgendamento;
