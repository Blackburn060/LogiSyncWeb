import React, { useEffect, useState } from "react";

interface DadosAgendamentoProps {
  dataAgendamento: string;
  horaAgendamento: string;
  produto: string;
  quantidade: number | null;
  observacao: string | null;
  safra?: string | null;
  arquivo?: string | Blob | null; 
  editable?: boolean; 
  motivoRecusa?: string | null; 
  situacaoAgendamento?: string;
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
  editable = false, 
  motivoRecusa,
  situacaoAgendamento,
  onProdutoChange,
  onQuantidadeChange,
  onSafraChange,
}) => {
  const [arquivoUrl, setArquivoUrl] = useState<string | null>(null);

  
  useEffect(() => {
    if (arquivo && arquivo instanceof Blob) {
      const url = URL.createObjectURL(arquivo);
      setArquivoUrl(url);
      return () => URL.revokeObjectURL(url); 
    } else if (typeof arquivo === "string") {
      setArquivoUrl(arquivo);
    }
  }, [arquivo]);

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    
    return `${dia}/${mes}/${ano}`;
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
            value={produto || ""}
            onChange={(e) => onProdutoChange && onProdutoChange(e.target.value)}
            readOnly={!editable} 
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
            readOnly={!editable} 
          />
        </div>
        <div>
          <label className="block font-semibold">Safra</label>
          <input
            type="text"
            className="border w-full px-2 py-1 rounded-md"
            value={safra || ""}
            onChange={(e) => onSafraChange && onSafraChange(e.target.value)}
            readOnly={!editable} 
          />
        </div>
        <div>
          <label className="block font-semibold">Arquivo</label>
          {arquivoUrl ? (
            <a
              href={arquivoUrl}
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
        
        {situacaoAgendamento === "Recusado" && motivoRecusa && (
          <div className="col-span-2">
            <label className="block font-semibold">Motivo da Recusa</label>
            <textarea
              className="border w-full px-2 py-1 rounded-md bg-gray-100"
              value={motivoRecusa}
              readOnly
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default DadosAgendamento;
