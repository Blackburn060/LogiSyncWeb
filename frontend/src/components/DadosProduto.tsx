import React, { useEffect, useState } from "react";
import api from "../services/axiosConfig";

interface Produto {
  DescricaoProduto: string;
  Categoria: string;
}

interface DadosProdutoProps {
  codigoProduto: number | null;
}

const DadosProduto: React.FC<DadosProdutoProps> = ({ codigoProduto }) => {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduto = async () => {
      if (codigoProduto) {
        try {
          const response = await api.get(`/produtos/${codigoProduto}`);
          setProduto(response.data);
        } catch (error) {
          console.error("Erro ao carregar dados do produto:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [codigoProduto]);

  if (loading) {
    return <p>Carregando dados do produto...</p>;
  }

  if (!produto) {
    return <p>Produto não encontrado.</p>;
  }

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">DADOS DO PRODUTO</h2>
      <p><strong>Descrição:</strong> {produto.DescricaoProduto}</p>
      <p><strong>Categoria:</strong> {produto.Categoria}</p>
    </div>
  );
};

export default DadosProduto;
