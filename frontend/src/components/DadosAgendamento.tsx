import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DadosAgendamentoProps {
  dataAgendamento: string;
  horaAgendamento: string;
  produto: string;
  quantidade: number | null;
  observacao: string | null;
  safra?: string | null;
  arquivo?: string | Blob | null; // Aceitando string ou Blob
  editable?: boolean; // Propriedade para permitir edição
  onProdutoChange?: (value: string) => void;
  onQuantidadeChange?: (value: number | null) => void;
  onSafraChange?: (value: string) => void;
}

const DadosAgendamento: React.FC<DadosAgendamentoProps> = ({
  dataAgendamento,
  horaAgendamento,
  produto,
  quantidade,
  observacao,
  safra,
  arquivo,
  editable = false, // Se editable for true, os campos serão editáveis
  onProdutoChange,
  onQuantidadeChange,
  onSafraChange,
}) => {
  // Função para formatar a data no formato dia/mês/ano
  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    return format(dataObj, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="border p-4 rounded-lg mb-4">
      <h2 className="text-xl font-bold">DADOS DO AGENDAMENTO</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Data</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={formatarData(dataAgendamento)}
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
            onChange={(e) => onProdutoChange && onProdutoChange(e.target.value)}
            readOnly={!!produto || !editable} // Só será editável se o produto estiver vazio e editable for true
          />
        </div>
        <div>
          <label className="block font-semibold">Quantidade</label>
          <input
            type="number"
            className="border w-full px-2 py-1 rounded-md"
            value={quantidade !== null ? String(quantidade) : ""}
            onChange={(e) =>
              onQuantidadeChange && onQuantidadeChange(Number(e.target.value))
            }
            readOnly={!!quantidade || !editable} // Só será editável se a quantidade estiver vazia e editable for true
          />
        </div>
        <div>
          <label className="block font-semibold">Safra</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={safra || ""}
            onChange={(e) => onSafraChange && onSafraChange(e.target.value)}
            readOnly={!!safra || !editable} // Só será editável se a safra estiver vazia e editable for true
          />
        </div>
        <div>
          <label className="block font-semibold">Arquivo</label>
          {arquivo && typeof arquivo === "string" ? (
            <a
              href={arquivo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download do arquivo
            </a>
          ) : arquivo ? (
            <p>Arquivo anexado (não pode ser exibido diretamente)</p>
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
